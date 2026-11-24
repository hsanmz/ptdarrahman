import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { apiFetch } from '@/api/client'
import {
  ArrowRight, Waves, DollarSign,
  ShieldCheck, Cpu, Award, Sparkles, LogIn, UserPlus,
  Users, ChevronRight, CheckCircle2, Laptop, Clock, Shield, ChevronDown,
  Trophy, Compass, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ArabesquePattern } from '@/components/landing/HeroDecorations'
import {
  PRESTASI_SANTRI,
  EKSKUL_OUTING,
  BIAYA_PENDIDIKAN,
} from '@/data/admissionData'

interface ActiveWaveData {
  active: boolean
  registration_open?: boolean
  registration_status?: string
  id?: string
  name?: string
  period_name?: string
  academic_year?: string
  quota?: number
  paid_count?: number
  form_fee?: number
  minimum_dp?: number
  registration_start_date?: string | null
  registration_end_date?: string | null
}

export default function LandingPage() {
  const navigate = useNavigate()
  const [wave, setWave] = useState<ActiveWaveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  useEffect(() => {
    apiFetch<ActiveWaveData>('/ppdb/waves/active-public')
      .then((data) => {
        setWave(data)
      })
      .catch(() => {
        setWave({ active: false })
      })
      .finally(() => setLoading(false))
  }, [])

  const isOpen = wave?.active === true || wave?.registration_open === true
  const totalQuota = wave?.quota && wave.quota > 0 ? wave.quota : 30
  const registeredCount = wave?.paid_count || 0
  const remainingQuota = Math.max(0, totalQuota - registeredCount)
  const quotaPercent = Math.min(100, Math.round((registeredCount / totalQuota) * 100))

  const keyStats = [
    {
      value: '30 Juz',
      label: 'Target Mutqin Bersanad',
      desc: 'Bimbingan intensif halaqah harian bersama Muhaffidz mukim dengan tradisi tasmi\' berkala.',
      icon: Award,
    },
    {
      value: '100%',
      label: 'Rekayasa Teknologi Digital',
      desc: 'Kurikulum modern pemrograman Web Fullstack, Database SQL, dan perangkat Internet of Things (IoT).',
      icon: Laptop,
    },
    {
      value: '1 : 10',
      label: 'Rasio Pembimbingan Halaqah',
      desc: 'Pengawasan adab, perkembangan hafalan, dan pembinaan karakter personal yang terpantau dekat.',
      icon: Users,
    },
    {
      value: '0 Gadget',
      label: 'Ekosistem Kondusif Asrama',
      desc: 'Fokus total pada Al-Qur\'an dan ilmu, bebas dari distraksi smartphone pribadi selama berasrama.',
      icon: Shield,
    },
  ]

  const ppdbSteps = [
    {
      step: '01',
      title: 'Pendaftaran',
      desc: 'Pengisian biodata lengkap 6 bagian (identitas santri, data wali, kuesioner kesehatan 10 soal) dan pembayaran biaya formulir via QRIS resmi.',
      badge: 'Registrasi & QRIS',
    },
    {
      step: '02',
      title: 'Verifikasi Berkas',
      desc: 'Pemeriksaan 6 berkas persyaratan resmi (NISN, KK, Akta Kelahiran, Pas Foto, KTP Wali, dan 4 Rapor terakhir) oleh panitia backoffice.',
      badge: 'Verifikasi Dokumen',
    },
    {
      step: '03',
      title: 'Seleksi Penerimaan Santri Baru',
      desc: 'Pelaksanaan ujian seleksi terpadu: CBT Akademik, CBT Psikologi, Uji Tahfidz Al-Qur\'an, dan Wawancara Terpadu santri & orang tua/wali.',
      badge: 'CBT & Tahfidz Terpadu',
    },
    {
      step: '04',
      title: 'Pengumuman',
      desc: 'Rilis hasil kelulusan seleksi santri baru di portal serta penerbitan Letter of Acceptance (LoA) resmi ber-HMAC dan QR verifikasi.',
      badge: 'Hasil & LoA Digital',
    },
    {
      step: '05',
      title: 'Daftar Ulang',
      desc: 'Penandatanganan digital LoA resmi bersama orang tua/wali (alur PPDB tuntas) dan penuntasan administrasi santri baru resmi terdaftar.',
      badge: 'Tuntas & Resmi',
    },
  ]

  const pillars = [
    {
      icon: Award,
      title: "Tahfidz 30 Juz Bersanad",
      desc: "Bimbingan intensif halaqah harian bersama Muhaffidz berpengalaman dengan target hafalan mutqin dan tradisi tasmi' terbuka berkala.",
      points: ['Metode talaqqi & murajaah intensif', 'Tasmi\' 1-5 Juz bertahap di hadapan masyaikh', 'Sanad qira\'ah bersambung ke Rasulullah SAW'],
    },
    {
      icon: Cpu,
      title: "Rekayasa Teknologi Digital",
      desc: "Santri menguasai dasar pemrograman modern, perancangan database, dan Internet of Things (IoT) di Lab Komputer khusus.",
      points: ['Logika algoritma & Web Development', 'Pengenalan mikrokontroler & sensor IoT', 'Etika digital & cyber security berlandaskan syariat'],
    },
    {
      icon: ShieldCheck,
      title: "Kemandirian & Adab Asrama",
      desc: "Penempaan karakter akhlak karimah, kepemimpinan, dan kemandirian berasrama penuh yang kondusif tanpa distraksi gadget.",
      points: ['Ketertiban shalat berjamaah 5 waktu & tahajjud', 'Lingkungan pergaulan berbahasa Arab & Inggris', 'Bimbingan konseling dan kesehatan santri siaga'],
    },
  ]

  const faqs = [
    {
      q: 'Bagaimana jika calon santri belum memiliki dasar hafalan Al-Qur\'an?',
      a: 'Santri tetap memiliki kesempatan yang sama. Seleksi tahfidz bertujuan memetakan makharijul huruf, tajwid, serta daya tangkap santri. Program matrikulasi khusus disediakan di awal tahun ajaran untuk menyelaraskan bacaan.',
    },
    {
      q: 'Apakah biaya pendidikan bisa diangsur?',
      a: 'Ya, biaya masuk dapat dibayarkan dengan komitmen pembayaran bertahap (minimal DP yang ditentukan) setelah santri resmi dinyatakan lulus dan menandatangani Letter of Acceptance (LoA).',
    },
    {
      q: 'Kapan seleksi ujian CBT dan wawancara dilaksanakan?',
      a: 'Ujian CBT dan wawancara dijadwalkan secara otomatis per batch/kloter setelah berkas persyaratan diverifikasi panitia. Informasi PIN sesi dan ruang ujian akan dikirim via notifikasi WhatsApp resmi H-2 dan H-1.',
    },
    {
      q: 'Bagaimana mekanisme kunjungan orang tua ke asrama?',
      a: 'Kunjungan orang tua dijadwalkan secara berkala setiap 2 pekan sekali pada hari Ahad, guna menjaga fokus proses halaqah santri dan membangun kemandirian di lingkungan pesantren.',
    },
  ]

  return (
    <div className="pt-20 md:pt-24 pb-16 bg-[#F7F5F0]/60 selection:bg-emerald-primary selection:text-white">
      {/* ── Hero Section ── */}
      <section className="relative overflow-hidden px-4 pt-6 pb-16 sm:pb-24 md:pt-10">
        {/* Sacred Geometry Texture & Ambient Lighting */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.035] text-emerald-primary overflow-hidden">
          <ArabesquePattern />
        </div>
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[520px] w-[95vw] max-w-5xl rounded-full bg-gradient-to-b from-emerald-100/60 via-emerald-50/30 to-transparent blur-3xl" />
        <div className="pointer-events-none absolute top-48 -right-24 h-80 w-80 rounded-full bg-gold-accent/15 blur-3xl" />
        <div className="pointer-events-none absolute top-64 -left-20 h-72 w-72 rounded-full bg-emerald-300/10 blur-2xl" />

        <div className="container relative z-10 mx-auto max-w-6xl">
          <div className="flex flex-col items-center text-center">
            {/* Status Wave Announcement Pill */}
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-emerald-primary/20 bg-white/90 px-4 py-2 text-xs md:text-sm font-semibold text-slate-800 shadow-sm backdrop-blur-md transition-all hover:border-emerald-primary/40 hover:shadow-md">
              {loading ? (
                <>
                  <Waves className="h-4 w-4 text-slate-400 animate-pulse" />
                  <span className="text-slate-400">Memuat status gelombang...</span>
                </>
              ) : isOpen ? (
                <>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                  </span>
                  <span>
                    Pendaftaran <strong className="text-emerald-primary font-bold">{wave?.name || 'Gelombang Aktif'}</strong> Resmi Dibuka (TA {wave?.academic_year || '2026/2027'})
                  </span>
                </>
              ) : (
                <>
                  <Waves className="h-4 w-4 text-slate-400" />
                  <span>
                    {wave?.registration_status === 'quota_reached'
                      ? 'Kuota Gelombang Saat Ini Telah Terpenuhi'
                      : 'Menunggu Pembukaan Gelombang Baru'}
                  </span>
                </>
              )}
            </div>

            {/* Ayat Suci & Ornamen Tradisi */}
            <div className="mb-3 flex items-center justify-center gap-3">
              <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-r from-transparent to-gold-accent/70" />
              <div className="font-serif text-2xl text-gold-dark opacity-95 md:text-3xl tracking-wide select-none">
                «اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ»
              </div>
              <span className="h-[1px] w-8 sm:w-16 bg-gradient-to-l from-transparent to-gold-accent/70" />
            </div>
            <p className="text-xs italic text-slate-500 sm:text-sm font-medium">
              {'"Bacalah dengan nama Tuhanmu yang menciptakan" — QS. Al-\'Alaq: 1'}
            </p>

            {/* Main Headline */}
            <h1 className="mt-6 font-heading text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-[4.2rem] leading-[1.12]">
              Penerimaan Santri Baru
              <br />
              <span className="text-lg sm:text-2xl md:text-3xl font-bold text-amber-800 block my-1">
                Jenjang SMK — Khusus Lulusan SMP / MTs
              </span>
              <span className="bg-gradient-to-r from-emerald-800 via-emerald-primary to-teal-700 bg-clip-text text-transparent">
                Pesantren Tahfidz Qur'an dan Digital Ar-Rahman
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              Pendidikan kejuruan SMK berbasis pesantren bagi calon santri putra lulusan SMP / MTs / sederajat. Memadukan hafalan Al-Qur'an 30 juz mutqin bersanad dengan keahlian rekayasa teknologi digital modern (Coding, Web Development &amp; IoT).
            </p>

            {/* Daya Tampung & Kuota Card Banner (Modern Institutional Widget) */}
            <div className="mt-8 w-full max-w-2xl rounded-3xl border border-emerald-100/90 bg-white/95 p-5 sm:p-6 shadow-xl shadow-emerald-950/5 backdrop-blur-md transition-all hover:border-emerald-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-primary border border-emerald-100 shadow-inner">
                    <Users className="h-7 w-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        Daya Tampung Santri Baru
                      </span>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                        Reguler
                      </span>
                    </div>
                    <div className="text-lg sm:text-2xl font-extrabold text-slate-900 flex flex-wrap items-center gap-2 mt-0.5">
                      <span>{totalQuota} Santri</span>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 whitespace-nowrap">
                        Sisa {remainingQuota} Slot
                      </span>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-44 text-left sm:text-right">
                  <div className="flex justify-between sm:justify-end items-center gap-2 text-xs text-slate-500 mb-1.5 font-medium">
                    <span>Keterisian Kuota:</span>
                    <span className="font-bold text-emerald-primary">{quotaPercent}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 p-0.5 border border-slate-100">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600 transition-all duration-700 ease-out shadow-sm"
                      style={{ width: `${quotaPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {wave?.registration_end_date && (
                <div className="mt-4 pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-emerald-primary" />
                    <span>Batas Akhir Gelombang:</span>
                  </div>
                  <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                    {new Date(wave.registration_end_date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Unified CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              <Button
                onClick={() => navigate('/register')}
                disabled={!isOpen}
                className={cn(
                  'h-auto gap-2.5 rounded-full px-8 py-3.5 text-sm sm:text-base font-bold shadow-lg transition-all hover:-translate-y-0.5 active:scale-95',
                  isOpen
                    ? 'bg-gradient-to-r from-emerald-primary to-emerald-dark text-white shadow-emerald-primary/30 hover:shadow-emerald-primary/40'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                )}
              >
                <UserPlus className="h-5 w-5" />
                <span>Daftar Santri Baru</span>
                <ArrowRight className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                onClick={() => navigate('/auth/login')}
                className="h-auto gap-2 rounded-full border-slate-300/80 bg-white/95 px-7 py-3.5 text-sm sm:text-base font-bold text-slate-800 backdrop-blur-md hover:bg-slate-50 hover:border-slate-400 shadow-sm"
              >
                <LogIn className="h-4 w-4 text-emerald-primary" />
                <span>Masuk / Login Portal</span>
              </Button>
            </div>

            {/* Trust Micro-Badges */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 font-medium">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Sistem Seleksi Terpadu Seragam
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Ujian CBT &amp; Tahfidz Terjadwal
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                LoA Digital Resmi &amp; Akuntabel
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* ── Key Metrics & Stats Strip ── */}
      <section className="relative px-4 py-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {keyStats.map((stat) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-primary border border-emerald-100">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="font-heading text-2xl font-extrabold text-slate-900 tracking-tight">
                      {stat.value}
                    </div>
                  </div>
                  <div className="text-sm font-bold text-slate-800">
                    {stat.label}
                  </div>
                  <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                    {stat.desc}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Visual Flow: 5 Langkah Alur Penerimaan PPDB ── */}
      <section className="relative px-4 py-14 sm:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="rounded-full bg-emerald-100/90 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-900">
              Alur Pendaftaran Terstruktur
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Tahapan Seleksi Menuju Santri Baru
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Lima langkah pendaftaran tersistem secara otomatis di portal santri dari pengisian biodata hingga terbitnya Letter of Acceptance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ppdbSteps.map((item) => (
              <div
                key={item.step}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 font-mono text-sm font-black text-emerald-primary border border-emerald-100 shadow-xs">
                      {item.step}
                    </span>
                    <span className="text-[10.5px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                      {item.badge}
                    </span>
                  </div>
                  <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-emerald-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-slate-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/alur-jadwal"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-primary hover:text-emerald-dark transition-colors"
            >
              <span>Pelajari Detail Timeline &amp; Ketentuan Batch Ujian</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Prestasi Santri Showcase ── */}
      <section className="relative px-4 py-14 sm:py-16 bg-gradient-to-b from-amber-50/40 via-white to-emerald-50/30 border-y border-slate-200/60">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-amber-900">
              <Trophy className="h-3.5 w-3.5 text-amber-600" />
              Torehan Prestasi Santri
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Prestasi Gemilang Santri PTDARRAHMAN
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Membuktikan sinergi nyata antara kedalaman ilmu Al-Qur'an, sains teknologi komputasi, dan kecakapan bahasa global.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PRESTASI_SANTRI.map((pres) => (
              <div
                key={pres.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-xl hover:border-amber-300 transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={cn('text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border', pres.badgeBg, pres.badgeText)}>
                      {pres.achievement}
                    </span>
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  </div>

                  <h3 className="font-heading text-lg font-bold text-slate-900 group-hover:text-emerald-primary transition-colors">
                    {pres.name}
                  </h3>
                  <div className="text-xs font-semibold text-emerald-700 mt-1">
                    Bidang Lomba: {pres.competitionField}
                  </div>

                  <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                    {pres.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  {pres.eventTitle}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/kurikulum-fasilitas"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-primary hover:text-emerald-dark transition-colors"
            >
              <span>Lihat Detail Kurikulum &amp; Prestasi Santri Selengkapnya</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Transparansi Biaya Pendidikan (Total Rp 25.000.000) ── */}
      <section className="relative px-4 py-14 sm:py-16">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto mb-10 max-w-2xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              <DollarSign className="h-3.5 w-3.5" />
              Transparansi Finansial
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">
              Biaya Pendidikan Santri Baru
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Investasi pendidikan transparan dan akuntabel tanpa pungutan tersembunyi selama masa pembinaan santri.
            </p>
          </div>

          {/* Table Preview 5 Komponen Biaya */}
          <div className="max-w-4xl mx-auto rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-emerald-900 to-emerald-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Total Estimasi Biaya Pendidikan
                </span>
                <div className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
                  Rp 25.000.000
                </div>
              </div>
              <Link
                to="/biaya-beasiswa"
                className="inline-flex items-center gap-2 rounded-full bg-gold-accent px-5 py-2.5 text-xs sm:text-sm font-bold text-emerald-950 hover:bg-gold-light transition-colors self-start sm:self-auto shadow-md"
              >
                <span>Rincian &amp; Beasiswa</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100">
              {BIAYA_PENDIDIKAN.map((item) => (
                <div key={item.no} className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500 text-xs font-bold font-mono">
                      {item.no}
                    </span>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-[11px] text-slate-500">{item.periodicity}</div>
                    </div>
                  </div>
                  <div className="font-heading text-sm sm:text-base font-extrabold text-slate-900 whitespace-nowrap">
                    Rp {item.nominal.toLocaleString('id-ID')}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
              <span>* Biaya formulir registrasi awal via QRIS: <strong>Rp 350.000</strong> (Non-Refundable).</span>
              <span className="text-emerald-700 font-semibold">Tersedia kuota Beasiswa Tahfidz &amp; Prestasi IT.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Program Harian & Ekskul Highlight Strip ── */}
      <section className="relative px-4 py-12 bg-slate-50/70 border-t border-slate-200/60">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-primary">
                Keseimbangan Hidup Berasrama
              </span>
              <h2 className="mt-1 font-heading text-2xl font-extrabold text-slate-900">
                18 Rutinitas Program Harian &amp; Ekskul
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Dari Tahajud di dini hari hingga Muthola'ah sebelum istirahat malam, diselingi olahraga dan outing class berkala.
              </p>
            </div>
            <Link
              to="/kurikulum-fasilitas"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-primary hover:text-emerald-dark transition-colors self-start md:self-auto"
            >
              <span>Jelajahi Jadwal Lengkap</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Ekskul Pills */}
          <div className="flex flex-wrap gap-2.5 mb-6">
            {EKSKUL_OUTING.map((ek) => (
              <span
                key={ek.id}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-emerald-300 transition-colors"
              >
                <Compass className="h-3.5 w-3.5 text-emerald-600" />
                {ek.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pillars: Mengapa PTDARRAHMAN? ── */}
      <section className="px-4 py-16 md:py-20">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-dark">
              Keunggulan Unggulan
            </span>
            <h2 className="mt-2 font-heading text-2xl sm:text-4xl font-extrabold text-slate-900">
              Sinergi Al-Qur'an dan Teknologi Masa Depan
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600">
              Di PTDARRAHMAN, kami percaya penghafal Al-Qur'an harus tampil percaya diri menjadi inovator dan pelopor teknologi yang berakhlak mulia.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon
              return (
                <div
                  key={p.title}
                  className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-emerald-100 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-primary mb-5 border border-emerald-100/60">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-slate-900">
                      {p.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {p.desc}
                    </p>
                  </div>

                  <ul className="mt-5 space-y-2 pt-4 border-t border-slate-100 text-xs text-slate-600">
                    {p.points.map((pt, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── Interactive FAQ Mini-Accordion ── */}
      <section className="px-4 py-12 md:py-16 bg-white/70 border-t border-slate-200/60">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <span className="rounded-full bg-emerald-100/80 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
              Paling Sering Ditanyakan
            </span>
            <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
              Pertanyaan Seputar PPDB &amp; Pesantren
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Temukan jawaban cepat atas pertanyaan yang sering diajukan orang tua pendaftar.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isExpanded = openFaq === index
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200/80 bg-white overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isExpanded ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-slate-800 hover:text-emerald-primary transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200',
                        isExpanded && 'rotate-180 text-emerald-primary'
                      )}
                    />
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              to="/faq"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-emerald-primary hover:text-emerald-dark"
            >
              <span>Lihat Semua Tanya Jawab Lengkap di Halaman FAQ</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA Band ── */}
      <section className="px-4 pt-10 pb-8">
        <div className="container mx-auto max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-obsidian via-emerald-dark to-emerald-primary px-6 py-12 sm:px-12 sm:py-16 text-center text-white shadow-2xl">
            {/* Arabic Decorative Watermark & Sacred Texture */}
            <div className="pointer-events-none absolute -bottom-16 -right-8 select-none font-serif text-[14rem] font-bold text-white/5">
              ار
            </div>
            <div className="pointer-events-none absolute inset-0 opacity-[0.05] text-white">
              <ArabesquePattern />
            </div>

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-accent/20 px-3.5 py-1 text-xs font-bold text-gold-accent backdrop-blur-md border border-gold-accent/30">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Penerimaan Santri Baru PTDARRAHMAN</span>
              </span>

              <h2 className="mt-4 font-heading text-2xl sm:text-4xl font-extrabold tracking-tight">
                Mulai Perjalanan Mulia Ananda Hari Ini
              </h2>
              <p className="mt-3 text-sm sm:text-base text-white/80 leading-relaxed">
                Bergabunglah bersama keluarga besar PTDARRAHMAN dan wujudkan cita-cita mencetak generasi Qur'ani yang berdaya saing digital internasional.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  onClick={() => navigate('/register')}
                  disabled={!isOpen}
                  className="h-auto gap-2 rounded-full bg-gold-accent px-8 py-3.5 text-sm sm:text-base font-bold text-emerald-dark shadow-lg shadow-gold-accent/30 transition-all hover:bg-gold-light hover:-translate-y-0.5 active:scale-95"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Daftar / Buat Akun Baru</span>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/auth/login')}
                  className="h-auto gap-2 rounded-full border-white/30 bg-white/10 px-7 py-3.5 text-sm sm:text-base font-bold text-white backdrop-blur-md hover:bg-white/20"
                >
                  <LogIn className="h-4 w-4" />
                  <span>Masuk ke Akun</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
