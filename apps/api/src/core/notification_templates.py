"""Canonical WhatsApp notification templates and idempotent DB sync helper.

Single source of truth shared by:
- ``scripts.seed_notifications`` (standalone CLI / SQL generator)
- ``scripts.seed`` (full project database seeder)
- Alembic migration ``0077_sync_whatsapp_notification_templates``
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

import sqlalchemy as sa
from sqlalchemy.engine import Connection

WIB = ZoneInfo("Asia/Jakarta")


@dataclass(frozen=True)
class NotificationTemplateSpec:
    """Immutable specification for a canonical WhatsApp notification template."""

    id: str
    event_key: str
    label: str
    body: str


WHATSAPP_TEMPLATES: tuple[NotificationTemplateSpec, ...] = (
    # ── Akun & Kredensial ─────────────────────────────────────────────────────
    NotificationTemplateSpec(
        id="nt-54-account_updated",
        event_key="account_updated",
        label="Username, Email, atau Nomor Telepon Diubah",
        body=(
            "🔐 *DATA AKUN DIPERBARUI*\n\n"
            "Halo *{nama_peserta}*, username, email, atau nomor telepon akun Anda "
            "telah diubah.\n\n"
            "Username: *{username}*\n"
            "Email: *{email}*\n"
            "Nomor telepon: *{phone}*\n\n"
            "Jika Anda tidak melakukan atau menyetujui perubahan ini, segera hubungi "
            "admin."
        ),
    ),
    NotificationTemplateSpec(
        id="nt-54-password_changed",
        event_key="password_changed",
        label="Password Diubah oleh Pemilik Akun",
        body=(
            "🔐 *PASSWORD AKUN BERHASIL DIUBAH*\n\n"
            "Halo *{nama_peserta}*, password akun Anda baru saja diubah. Pesan ini "
            "hanya sebagai konfirmasi dan tidak memuat password.\n\n"
            "Jika Anda tidak melakukan perubahan ini, segera hubungi admin."
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-0020-password-reset",
        event_key="password_reset",
        label="Password Direset (Kredensial Baru)",
        body=(
            "🔐 *PASSWORD AKUN DIRESET*\n\n"
            "Halo *{nama_peserta}*,\n"
            "Password akun Anda telah direset oleh admin. Berikut kredensial login "
            "terbaru Anda:\n"
            "👤 Username: *{username}*\n"
            "🔑 Password Baru: *{password}*\n"
            "🌐 Link Login: {link_login}\n\n"
            "Segera login dan ganti password Anda ke yang lebih aman.\n\n"
            "Panitia PPDB PTDARRAHMAN"
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-0019-user-created",
        event_key="user_created",
        label="Akun Admin Dibuat oleh Superadmin",
        body=(
            "👤 *AKUN ADMIN DIBUAT*\n\n"
            "Assalamualaikum *{nama_peserta}*,\n"
            "Akun Anda di sistem PTDARRAHMAN telah dibuat oleh Superadmin.\n\n"
            "Data Login:\n"
            "👤 Username: *{username}*\n"
            "🔑 Password: *{password}*\n"
            "🌐 Link Login: {link_login}\n\n"
            "Segera login dan ganti password Anda.\n\n"
            "Admin PTDARRAHMAN"
        ),
    ),
    # ── Fase 1: Pendaftaran Awal & Pembayaran Formulir ────────────────────────
    NotificationTemplateSpec(
        id="notiftmpl-1001-reg-account",
        event_key="registration_account_created",
        label="Pendaftaran Akun Berhasil",
        body=(
            "📢 *Pendaftaran Akun Berhasil!*\n\n"
            "Assalamu'alaikum / Halo *{nama_peserta}*,\n"
            "Terima kasih telah mendaftar di *{nama_sekolah}*. Akun PPDB Anda "
            "telah berhasil dibuat.\n\n"
            "Berikut adalah detail akses Anda:\n"
            "👤 Username: *{username}*\n"
            "🔑 Password: *{password}*\n"
            "🌐 Link Login: *{link_login}*\n\n"
            "⚠️ *Penting:*\n"
            "Langkah Anda selanjutnya adalah melakukan *Pembayaran Biaya Formulir*. "
            "Harap segera login ke sistem untuk melihat tagihan Anda. Batas akhir "
            "pembayaran formulir adalah sampai gelombang pendaftaran ditutup pada "
            "*{tanggal_tutup_gelombang}*."
        ),
    ),
    NotificationTemplateSpec(
        id="notif-1002-payment-formulir-succ",
        event_key="payment_success_formulir",
        label="Pembayaran Formulir Berhasil",
        body=(
            "✅ *Pembayaran Formulir Berhasil!*\n\n"
            "Halo *{nama_peserta}*, pembayaran formulir Anda telah kami terima. "
            "Silakan submit dokumen melalui dashboard agar dapat ditinjau panitia: "
            "{link_aplikasi}"
        ),
    ),
    NotificationTemplateSpec(
        id="notif-1004-payment-rem-monday",
        event_key="payment_reminder_monday",
        label="Pengingat Bayar Formulir (Senin)",
        body=(
            "🔔 *PENGINGAT PEMBAYARAN FORMULIR*\n\n"
            "Halo *{nama_peserta}*, pembayaran formulir Anda masih belum kami "
            "terima. Silakan lanjutkan pembayaran sebelum gelombang "
            "*{nama_gelombang}* ditutup pada *{tanggal_tutup}*.\n\n"
            "Lanjutkan pendaftaran: *{link_pembayaran}*\n\n"
            "Abaikan pesan ini jika Anda sudah membayar."
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-0004-payment-expired",
        event_key="payment_expired",
        label="Pembayaran Formulir Kedaluwarsa",
        body=(
            "❌ *MASA PEMBAYARAN FORMULIR BERAKHIR*\n\n"
            "Halo *{nama_peserta}*,\n\n"
            "Tagihan pembayaran formulir Anda telah kedaluwarsa dan dibatalkan. "
            "Tagihan ini tidak dapat dibayar lagi. Silakan mendaftar kembali "
            "jika gelombang berikutnya tersedia.\n\n"
            "Terima kasih,\n"
            "Panitia PPDB Pesantren Tahfidz Qur'an dan Digital Ar-Rahman"
        ),
    ),
    # ── Fase 2: Verifikasi Dokumen ────────────────────────────────────────────
    NotificationTemplateSpec(
        id="notiftmpl-0055-documents-submitted",
        event_key="documents_submitted",
        label="Dokumen Dikirim untuk Verifikasi",
        body=(
            "📩 *DOKUMEN BERHASIL DIKIRIM*\n\n"
            "Halo *{nama_peserta}*, dokumen Anda sudah dikirim untuk ditinjau "
            "panitia. Pantau status dan informasi revisi melalui dashboard: "
            "{link_aplikasi}"
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-1005-doc-rejected-revision",
        event_key="document_rejected_revision",
        label="Dokumen Ditolak — Perlu Revisi",
        body=(
            "⚠️ *Pemberitahuan Revisi Dokumen PPDB*\n\n"
            "Halo *{nama_peserta}*,\n"
            "Tim kami telah memeriksa dokumen yang Anda unggah. Mohon maaf, dokumen "
            "Anda belum dapat divalidasi karena alasan berikut:\n\n"
            "❌ *{alasan_penolakan}*\n\n"
            "🔄 *Langkah Selanjutnya:*\n"
            "Agar dapat melanjutkan ke tahap Ujian, silakan login ke "
            "*{link_aplikasi}* dan unggah ulang dokumen perbaikan sesegera mungkin."
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-1006-doc-approved",
        event_key="document_approved",
        label="Dokumen Disetujui — Jadwal Ditetapkan Panitia",
        body=(
            "✅ *DOKUMEN PENDAFTARAN DISETUJUI*\n\n"
            "Halo *{nama_peserta}*, dokumen persyaratan Anda telah disetujui. "
            "Jadwal seleksi ditetapkan oleh panitia dan akan dikirim melalui "
            "WhatsApp serta dashboard. Anda tidak perlu memilih jadwal sendiri: "
            "{link_aplikasi}"
        ),
    ),
    # ── Fase 3: Seleksi & Wawancara ───────────────────────────────────────────
    NotificationTemplateSpec(
        id="notiftmpl-1009-session-confirmed",
        event_key="session_confirmed",
        label="Jadwal Seleksi Ditetapkan atau Diubah",
        body=(
            "📅 *JADWAL SELEKSI DITETAPKAN / DIPERBARUI*\n\n"
            "Halo *{nama_peserta}*, jadwal *{nama_ujian}* Anda telah ditetapkan "
            "atau diperbarui.\n\n"
            "📆 Tanggal: *{tanggal}*\n"
            "⏰ Waktu: *{jam_mulai} - {jam_selesai}*\n"
            "📍 Lokasi/Link: *{lokasi_atau_link}*\n\n"
            "Jadwal ditetapkan oleh panitia; Anda tidak perlu memilih sesi. Harap "
            "hadir/bergabung 15 menit lebih awal. Detail tersedia di: {link_aplikasi}"
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-0073-session-broadcast",
        event_key="selection_session_broadcast",
        label="Informasi Tambahan Sesi Seleksi",
        body=(
            "Halo *{nama_peserta}*,\n\n"
            "Informasi untuk sesi *{session_name}*:\n"
            "{custom_message}\n\n"
            "Terima kasih,\n"
            "Panitia PPDB PTDARRAHMAN"
        ),
    ),
    NotificationTemplateSpec(
        id="nt-54-assessment_stage_completed",
        event_key="assessment_stage_completed",
        label="Tahap Penilaian Selesai",
        body=(
            "✅ *TAHAP PENILAIAN SELESAI*\n\n"
            "Halo *{nama_peserta}*, tahap *{nama_tahap}* telah selesai dan "
            "dicatat.\n\n"
            "Pantau dashboard untuk informasi jadwal tahap berikutnya atau hasil "
            "pendaftaran: {link_aplikasi}"
        ),
    ),
    # ── Fase 4: Hasil Pendaftaran & LoA ───────────────────────────────────────
    NotificationTemplateSpec(
        id="nt-54-registration_result_passed",
        event_key="registration_result_passed",
        label="Hasil Pendaftaran: Lulus",
        body=(
            "🎉 *HASIL PENDAFTARAN: LULUS*\n\n"
            "Selamat *{nama_peserta}*, Anda dinyatakan *LULUS* dalam proses "
            "pendaftaran Pesantren Tahfidz Qur'an dan Digital Ar-Rahman.\n\n"
            "Silakan buka laman Hasil Pendaftaran di {link_aplikasi} untuk melihat "
            "persetujuan, meninjau Letter of Acceptance (LoA), dan menyelesaikan "
            "tanda tangan. Rincian biaya pendidikan tercantum pada LoA; penyetoran "
            "dilakukan di luar aplikasi."
        ),
    ),
    NotificationTemplateSpec(
        id="nt-59-registration_result_conditiona",
        event_key="registration_result_conditional",
        label="Hasil Pendaftaran: Diterima Bersyarat",
        body=(
            "📋 *HASIL PENDAFTARAN: DITERIMA BERSYARAT*\n\n"
            "Halo *{nama_peserta}*, berdasarkan keputusan panitia PPDB Pesantren "
            "Tahfidz Qur'an dan Digital Ar-Rahman, hasil pendaftaran Anda saat ini "
            "*DITERIMA BERSYARAT*.\n\n"
            "Catatan panitia: {catatan}\n\n"
            "Silakan hubungi panitia untuk penjelasan syarat berkelanjutan dan "
            "pantau laman Hasil Pendaftaran: {link_aplikasi}"
        ),
    ),
    NotificationTemplateSpec(
        id="nt-59-registration_result_waitlist",
        event_key="registration_result_waitlist",
        label="Hasil Pendaftaran: Cadangan",
        body=(
            "📌 *HASIL PENDAFTARAN: CADANGAN*\n\n"
            "Halo *{nama_peserta}*, berdasarkan keputusan panitia PPDB Pesantren "
            "Tahfidz Qur'an dan Digital Ar-Rahman, Anda masuk dalam daftar "
            "*CADANGAN*.\n\n"
            "Catatan panitia: {catatan}\n\n"
            "Status bisa naik menjadi Diterima apabila terjadi kuota; pantau laman "
            "Hasil Pendaftaran: {link_aplikasi}"
        ),
    ),
    NotificationTemplateSpec(
        id="nt-54-registration_result_failed",
        event_key="registration_result_failed",
        label="Hasil Pendaftaran: Tidak Lulus",
        body=(
            "📢 *HASIL PENDAFTARAN: TIDAK LULUS*\n\n"
            "Halo *{nama_peserta}*, terima kasih telah mengikuti seluruh tahapan "
            "penilaian PPDB Pesantren Tahfidz Qur'an dan Digital Ar-Rahman.\n\n"
            "Dengan berat hati kami sampaikan bahwa hasil pendaftaran Anda saat ini "
            "*TIDAK LULUS*. Semoga tetap semangat dan memperoleh kesempatan "
            "terbaik."
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-0056-loa-signed",
        event_key="loa_signed",
        label="LoA Ditandatangani — PPDB Selesai",
        body=(
            "✅ *LOA BERHASIL DITANDATANGANI*\n\n"
            "Halo *{nama_peserta}*, LoA Anda telah ditandatangani oleh orang "
            "tua/wali. Alur pendaftaran PPDB Anda telah selesai. Silakan simpan LoA "
            "pada dashboard: {link_aplikasi}"
        ),
    ),
    # ── Fase 5: Pengingat Otomatis (Scheduler) ────────────────────────────────
    NotificationTemplateSpec(
        id="notiftmpl-1016-reminder-upload-docs",
        event_key="reminder_upload_docs_h3",
        label="Pengingat Submit Dokumen H+3",
        body=(
            "🔔 *PENGINGAT SUBMIT DOKUMEN*\n\n"
            "Halo *{nama_peserta}*, pembayaran formulir Anda telah berhasil, tetapi "
            "Anda belum submit dokumen apa pun. Silakan submit dokumen melalui "
            "dashboard: {link_aplikasi}"
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-1021-reminder-exam-h2",
        event_key="reminder_exam_h2",
        label="Pengingat Jadwal Seleksi H-2",
        body=(
            "🔔 *PENGINGAT JADWAL SELEKSI (H-2)*\n\n"
            "Halo *{nama_peserta}*,\n"
            "Mengingatkan kembali bahwa Ujian/Seleksi *{nama_ujian}* Anda akan "
            "dilaksanakan dalam *2 hari lagi*:\n\n"
            "📆 Tanggal: *{tanggal}*\n"
            "⏰ Waktu: *{waktu}*\n"
            "📍 Lokasi/Link: *{lokasi_atau_link}*\n\n"
            "Mohon persiapkan diri dan perangkat Anda dengan baik. Informasi detail "
            "dapat dilihat di: {link_aplikasi}"
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-1022-reminder-exam-h1",
        event_key="reminder_exam_h1",
        label="Pengingat Jadwal Seleksi H-1 (Besok)",
        body=(
            "🔔 *PENGINGAT JADWAL SELEKSI (H-1 / BESOK)*\n\n"
            "Halo *{nama_peserta}*,\n"
            "Besok adalah hari pelaksanaan Ujian/Seleksi *{nama_ujian}* Anda:\n\n"
            "📆 Tanggal: *{tanggal}*\n"
            "⏰ Waktu: *{waktu}*\n"
            "📍 Lokasi/Link: *{lokasi_atau_link}*\n\n"
            "Harap hadir/bergabung 15 menit sebelum waktu yang ditentukan. Semoga "
            "diberikan kelancaran dan kemudahan!"
        ),
    ),
    NotificationTemplateSpec(
        id="notiftmpl-1018-reminder-exam-1hour",
        event_key="reminder_exam_1hour",
        label="Pengingat Ujian 1 Jam Sebelum",
        body=(
            "🔔 *PENGINGAT UJIAN (1 JAM LAGI)*\n\n"
            "Halo *{nama_peserta}*,\n"
            "Mengingatkan kembali bahwa Ujian *{nama_ujian}* Anda akan dimulai "
            "*1 jam lagi* pada pukul *{waktu}*.\n\n"
            "📍 *Detail/Link:* *{lokasi_atau_link}*\n\n"
            "Harap segera bersiap dan gabung/hadir 15 menit sebelum sesi dimulai. "
            "Semoga sukses!"
        ),
    ),
)

# Stale bodies seeded by older seed.py versions that still referenced email or old copy.
LEGACY_SEED_BODIES: dict[str, tuple[str, ...]] = {
    "account_updated": (
        (
            "Halo {nama_peserta},\n\n"
            "Data kontak akun Anda telah diperbarui oleh admin:\n"
            "  Username: {username}\n"
            "  Email: {email}\n"
            "  No. WhatsApp: {phone}\n\n"
            "Bila Anda tidak merasa melakukan perubahan ini, segera hubungi admin.\n\n"
            "Terima kasih,\nAdmin PTDARRAHMAN"
        ),
    ),
    "document_approved": (
        (
            "Halo {nama_peserta},\n\n"
            "Selamat! Dokumen persyaratan Anda telah disetujui. Kami akan "
            "menginformasikan jadwal seleksi melalui email dan WhatsApp.\n\n"
            "Terima kasih,\nPanitia PPDB Pesantren Tahfidz Qur'an dan Digital Ar-Rahman"
        ),
    ),
}

# Backwards-compatible dict view (matches legacy seed.py NOTIF_TEMPLATES shape).
NOTIF_TEMPLATES: list[dict[str, str | None]] = [
    {
        "id": tpl.id,
        "event_key": tpl.event_key,
        "label": tpl.label,
        "channel": "whatsapp",
        "email_subject": None,
        "body": tpl.body,
    }
    for tpl in WHATSAPP_TEMPLATES
]


def _now_wib_naive() -> datetime:
    return datetime.now(WIB).replace(tzinfo=None)


def sync_notification_templates(
    conn: Connection,
    *,
    force: bool = False,
) -> dict[str, int]:
    """Ensure all canonical WhatsApp notification templates exist in DB.

    When ``force`` is False (default), missing templates are inserted, legacy
    non-WhatsApp channels (``email``/``both``) are normalized to ``whatsapp``,
    and known stale ``seed.py`` default bodies are upgraded while preserving any
    custom edits made by administrators. When ``force`` is True, all canonical
    templates are reset to their canonical label, channel, body, and active flag.
    """
    now = _now_wib_naive()
    created = 0
    updated = 0
    unchanged = 0

    existing_rows = (
        conn.execute(
            sa.text(
                "SELECT id, event_key, label, channel, email_subject, body, is_active "
                "FROM notification_templates"
            )
        )
        .mappings()
        .all()
    )
    by_key: dict[str, dict[str, Any]] = {
        str(row["event_key"]): dict(row) for row in existing_rows
    }

    for tpl in WHATSAPP_TEMPLATES:
        existing = by_key.get(tpl.event_key)
        if existing is None:
            conn.execute(
                sa.text(
                    "INSERT INTO notification_templates "
                    "(id, event_key, label, channel, email_subject, body, is_active, "
                    "created_at, updated_at) "
                    "VALUES (:id, :event_key, :label, 'whatsapp', NULL, :body, "
                    ":active, :created_at, :updated_at)"
                ),
                {
                    "id": tpl.id,
                    "event_key": tpl.event_key,
                    "label": tpl.label,
                    "body": tpl.body,
                    "active": True,
                    "created_at": now,
                    "updated_at": now,
                },
            )
            created += 1
            continue

        existing_body = str(existing.get("body") or "")
        is_stale_seed_body = existing_body in LEGACY_SEED_BODIES.get(tpl.event_key, ())
        needs_channel_fix = (
            existing.get("channel") != "whatsapp"
            or existing.get("email_subject") is not None
        )

        if force:
            conn.execute(
                sa.text(
                    "UPDATE notification_templates "
                    "SET label = :label, channel = 'whatsapp', email_subject = NULL, "
                    "body = :body, is_active = :active, updated_at = :updated_at "
                    "WHERE event_key = :event_key"
                ),
                {
                    "event_key": tpl.event_key,
                    "label": tpl.label,
                    "body": tpl.body,
                    "active": True,
                    "updated_at": now,
                },
            )
            updated += 1
        elif is_stale_seed_body:
            conn.execute(
                sa.text(
                    "UPDATE notification_templates "
                    "SET label = :label, channel = 'whatsapp', email_subject = NULL, "
                    "body = :body, updated_at = :updated_at "
                    "WHERE event_key = :event_key"
                ),
                {
                    "event_key": tpl.event_key,
                    "label": tpl.label,
                    "body": tpl.body,
                    "updated_at": now,
                },
            )
            updated += 1
        elif needs_channel_fix:
            conn.execute(
                sa.text(
                    "UPDATE notification_templates "
                    "SET channel = 'whatsapp', email_subject = NULL, "
                    "updated_at = :updated_at "
                    "WHERE event_key = :event_key"
                ),
                {"event_key": tpl.event_key, "updated_at": now},
            )
            updated += 1
        else:
            unchanged += 1

    return {"created": created, "updated": updated, "unchanged": unchanged}


def _sql_escape(value: str) -> str:
    return (
        value.replace("\\", "\\\\")
        .replace("'", "\\'")
        .replace("\r\n", "\\n")
        .replace("\n", "\\n")
    )


def render_mysql_upsert_sql() -> str:
    """Generate a MySQL-ready SQL script to upsert all WhatsApp templates."""
    lines = [
        "-- PTDARRAHMAN — Seed / Sinkronisasi 23 Template Notifikasi WhatsApp",
        "-- Jalankan di phpMyAdmin atau MySQL CLI pada database aplikasi.",
        "",
    ]
    for tpl in WHATSAPP_TEMPLATES:
        lines.append(
            "INSERT INTO `notification_templates` "
            "(`id`, `event_key`, `label`, `channel`, `email_subject`, `body`, "
            "`is_active`, `created_at`, `updated_at`) VALUES ("
            f"'{_sql_escape(tpl.id)}', "
            f"'{_sql_escape(tpl.event_key)}', "
            f"'{_sql_escape(tpl.label)}', "
            "'whatsapp', NULL, "
            f"'{_sql_escape(tpl.body)}', "
            "1, NOW(), NOW()) "
            "ON DUPLICATE KEY UPDATE "
            "`label` = VALUES(`label`), "
            "`channel` = 'whatsapp', "
            "`email_subject` = NULL, "
            "`body` = VALUES(`body`), "
            "`is_active` = 1, "
            "`updated_at` = NOW();"
        )
    lines.append("")
    return "\n".join(lines)
