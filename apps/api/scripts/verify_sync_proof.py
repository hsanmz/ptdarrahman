"""Live synchronization verification test.
Proves that writes via CMS endpoints update the MySQL database
and are immediately visible on public API endpoints with 0-second lag.
"""
from __future__ import annotations

import socket
# Force IPv4 resolution for hostnames to prevent [Errno 101] Network is unreachable on WSL2
_orig_getaddrinfo = socket.getaddrinfo
def _ipv4_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    return _orig_getaddrinfo(host, port, socket.AF_INET, type, proto, flags)
socket.getaddrinfo = _ipv4_getaddrinfo

import json
import time
from starlette.testclient import TestClient
from src.main import app
from src.core.security import create_access_token

import sys
_orig_print = print
def print(*args, **kwargs):
    kwargs["flush"] = True
    _orig_print(*args, **kwargs)

token = create_access_token({"sub": "user-superadmin", "username": "superadmin"})
auth_headers = {"Authorization": f"Bearer {token}"}
client = TestClient(app)

def safe_get(url: str, retries: int = 4):
    for i in range(retries):
        try:
            res = client.get(url)
            if res.status_code == 200:
                return res
        except Exception:
            pass
        time.sleep(1)
    return client.get(url)

def safe_put(url: str, json_data: dict, headers: dict, retries: int = 4):
    for i in range(retries):
        try:
            res = client.put(url, json=json_data, headers=headers)
            if res.status_code == 200:
                return res
        except Exception:
            pass
        time.sleep(1)
    return client.put(url, json=json_data, headers=headers)

print("=" * 72)
print("=== BUKTI NYATA SINKRONISASI CMS -> DATABASE -> CP WEB ===")
print("=" * 72)

# 1. HERO SLIDES
print("\n[*] TEST 1: Hero Slides (Homepage Hero Banner)")
res1 = safe_get("/companyprofile/hero-slides")
assert res1.status_code == 200
hero0 = res1.json()[0]
content0 = json.loads(hero0["content"]) if isinstance(hero0["content"], str) else hero0["content"]
orig_title = content0.get("title")
print(f"1. [Kondisi Awal] Judul Hero: \"{orig_title[:40]}...\"")

test_title = "TEST_SINKRONISASI_HERO_BERHASIL"
content0["title"] = test_title
payload = {
    "image": hero0.get("image") or "",
    "order": hero0.get("order", 0),
    "content": json.dumps(content0)
}
t0 = time.time()
res_put = safe_put(f"/companyprofile/hero-slides/{hero0['id']}", json_data=payload, headers=auth_headers)
t_put = (time.time() - t0) * 1000
assert res_put.status_code == 200, res_put.text
print(f"2. [CMS UPDATE] Status: {res_put.status_code} ({t_put:.1f}ms) -> Judul diubah ke: \"{test_title}\"")

t1 = time.time()
res2 = safe_get("/companyprofile/hero-slides")
t_get = (time.time() - t1) * 1000
assert res2.status_code == 200
updated_content = json.loads(res2.json()[0]["content"]) if isinstance(res2.json()[0]["content"], str) else res2.json()[0]["content"]
print(f"3. [CP WEB PUBLIC GET] Judul terbaca di web: \"{updated_content.get('title')}\" ({t_get:.1f}ms)")
assert updated_content.get("title") == test_title
print("   >>> HASIL TEST 1: SINKRON 100% INSTAN TANPA JEDA! <<<")

# Revert
content0["title"] = orig_title
payload["content"] = json.dumps(content0)
safe_put(f"/companyprofile/hero-slides/{hero0['id']}", json_data=payload, headers=auth_headers)
reverted_content = json.loads(safe_get("/companyprofile/hero-slides").json()[0]["content"]) if isinstance(safe_get("/companyprofile/hero-slides").json()[0]["content"], str) else safe_get("/companyprofile/hero-slides").json()[0]["content"]
print(f"4. [RESTORE] Dikembalikan ke judul awal: \"{reverted_content.get('title')[:40]}...\"")
assert reverted_content.get("title") == orig_title


# 2. FACILITIES
print("\n[*] TEST 2: Facilities (Halaman Fasilitas)")
res_fac1 = safe_get("/companyprofile/facilities")
assert res_fac1.status_code == 200
fac0 = res_fac1.json()[0]
fac_content = json.loads(fac0["content"]) if isinstance(fac0["content"], str) else fac0["content"]
orig_fac_name = fac_content.get("name")
print(f"1. [Kondisi Awal] Nama Fasilitas: \"{orig_fac_name}\"")

test_fac_name = "Ruang Lab Programming & Robotika (TEST SINKRON)"
fac_content["name"] = test_fac_name
fac_payload = {
    "image": fac0.get("image") or "",
    "category": fac0.get("category", "tech"),
    "content": json.dumps(fac_content)
}
t0 = time.time()
res_fac_put = safe_put(f"/companyprofile/facilities/{fac0['id']}", json_data=fac_payload, headers=auth_headers)
t_put = (time.time() - t0) * 1000
assert res_fac_put.status_code == 200, res_fac_put.text
print(f"2. [CMS UPDATE] Status: {res_fac_put.status_code} ({t_put:.1f}ms) -> Nama diubah ke: \"{test_fac_name}\"")

t1 = time.time()
res_fac2 = safe_get("/companyprofile/facilities")
t_get = (time.time() - t1) * 1000
assert res_fac2.status_code == 200
updated_fac = json.loads(res_fac2.json()[0]["content"]) if isinstance(res_fac2.json()[0]["content"], str) else res_fac2.json()[0]["content"]
print(f"3. [CP WEB PUBLIC GET] Nama terbaca di web: \"{updated_fac.get('name')}\" ({t_get:.1f}ms)")
assert updated_fac.get("name") == test_fac_name
print("   >>> HASIL TEST 2: SINKRON 100% INSTAN TANPA JEDA! <<<")

# Revert
fac_content["name"] = orig_fac_name
fac_payload["content"] = json.dumps(fac_content)
safe_put(f"/companyprofile/facilities/{fac0['id']}", json_data=fac_payload, headers=auth_headers)
reverted_fac = json.loads(safe_get("/companyprofile/facilities").json()[0]["content"]) if isinstance(safe_get("/companyprofile/facilities").json()[0]["content"], str) else safe_get("/companyprofile/facilities").json()[0]["content"]
print(f"4. [RESTORE] Dikembalikan ke nama semula: \"{reverted_fac.get('name')}\"")
assert reverted_fac.get("name") == orig_fac_name


# 3. FAQ ITEMS
print("\n[*] TEST 3: FAQ Items (Halaman FAQ & Kontak)")
res_faq1 = safe_get("/companyprofile/faq")
assert res_faq1.status_code == 200
faq0 = res_faq1.json()[0]
orig_faq_q = faq0.get("question")
orig_faq_a = faq0.get("answer")
print(f"1. [Kondisi Awal] Pertanyaan FAQ: \"{orig_faq_q}\"")

test_faq_q = "Apakah kurikulum PTDARRAHMAN mencakup AI? (TEST SINKRON)"
faq_payload = {
    "question": test_faq_q,
    "answer": orig_faq_a,
    "category": faq0.get("category", "Umum"),
    "order": faq0.get("order", 0)
}
t0 = time.time()
res_faq_put = safe_put(f"/companyprofile/faq/{faq0['id']}", json_data=faq_payload, headers=auth_headers)
t_put = (time.time() - t0) * 1000
assert res_faq_put.status_code == 200, res_faq_put.text
print(f"2. [CMS UPDATE] Status: {res_faq_put.status_code} ({t_put:.1f}ms) -> Pertanyaan diubah ke: \"{test_faq_q}\"")

t1 = time.time()
res_faq2 = safe_get("/companyprofile/faq")
t_get = (time.time() - t1) * 1000
assert res_faq2.status_code == 200
updated_faq_q = res_faq2.json()[0].get("question")
print(f"3. [CP WEB PUBLIC GET] Pertanyaan terbaca di web: \"{updated_faq_q}\" ({t_get:.1f}ms)")
assert updated_faq_q == test_faq_q
print("   >>> HASIL TEST 3: SINKRON 100% INSTAN TANPA JEDA! <<<")

# Revert
faq_payload["question"] = orig_faq_q
safe_put(f"/companyprofile/faq/{faq0['id']}", json_data=faq_payload, headers=auth_headers)
reverted_faq_q = safe_get("/companyprofile/faq").json()[0].get("question")
print(f"4. [RESTORE] Dikembalikan ke pertanyaan semula: \"{reverted_faq_q}\"")
assert reverted_faq_q == orig_faq_q


# 4. CONTACT INFO
print("\n[*] TEST 4: Contact Info (Footer & Halaman Kontak)")
res_contact1 = safe_get("/companyprofile/contact-info")
assert res_contact1.status_code == 200
orig_phone = res_contact1.json().get("phone_primary")
print(f"1. [Kondisi Awal] Telepon Utama: \"{orig_phone}\"")

test_phone = "0812-9999-8888 (TEST SINKRON)"
allowed_fields = {
    "phone_primary", "phone_secondary", "whatsapp",
    "email_primary", "email_admission", "address",
    "office_hours", "maps_embed"
}
contact_payload = {k: v for k, v in res_contact1.json().items() if k in allowed_fields}
contact_payload["phone_primary"] = test_phone
t0 = time.time()
res_contact_put = safe_put("/companyprofile/contact-info", json_data=contact_payload, headers=auth_headers)
t_put = (time.time() - t0) * 1000
assert res_contact_put.status_code == 200, res_contact_put.text
print(f"2. [CMS UPDATE] Status: {res_contact_put.status_code} ({t_put:.1f}ms) -> Telepon diubah ke: \"{test_phone}\"")

t1 = time.time()
res_contact2 = safe_get("/companyprofile/contact-info")
t_get = (time.time() - t1) * 1000
assert res_contact2.status_code == 200
updated_phone = res_contact2.json().get("phone_primary")
print(f"3. [CP WEB PUBLIC GET] Telepon terbaca di web: \"{updated_phone}\" ({t_get:.1f}ms)")
assert updated_phone == test_phone
print("   >>> HASIL TEST 4: SINKRON 100% INSTAN TANPA JEDA! <<<")

# Revert
contact_payload["phone_primary"] = orig_phone
safe_put("/companyprofile/contact-info", json_data=contact_payload, headers=auth_headers)
reverted_phone = safe_get("/companyprofile/contact-info").json().get("phone_primary")
print(f"4. [RESTORE] Dikembalikan ke nomor semula: \"{reverted_phone}\"")
assert reverted_phone == orig_phone


# 5. SITE SETTINGS
print("\n[*] TEST 5: Site Settings (Statistik Santri Beranda)")
res_set1 = safe_get("/companyprofile/settings")
assert res_set1.status_code == 200
settings_list = res_set1.json()
orig_students = next((s["value"] for s in settings_list if s["key"] == "stat_students"), "350")
print(f"1. [Kondisi Awal] stat_students: \"{orig_students}\"")

test_students = "999"
t0 = time.time()
res_set_put = safe_put("/companyprofile/settings/stat_students", json_data={"value": test_students}, headers=auth_headers)
t_put = (time.time() - t0) * 1000
assert res_set_put.status_code == 200, res_set_put.text
print(f"2. [CMS UPDATE] Status: {res_set_put.status_code} ({t_put:.1f}ms) -> Nilai diubah ke: \"{test_students}\"")

t1 = time.time()
res_set2 = safe_get("/companyprofile/settings")
t_get = (time.time() - t1) * 1000
assert res_set2.status_code == 200
updated_students = next((s["value"] for s in res_set2.json() if s["key"] == "stat_students"), None)
print(f"3. [CP WEB PUBLIC GET] stat_students terbaca di web: \"{updated_students}\" ({t_get:.1f}ms)")
assert updated_students == test_students
print("   >>> HASIL TEST 5: SINKRON 100% INSTAN TANPA JEDA! <<<")

# Revert
safe_put("/companyprofile/settings/stat_students", json_data={"value": orig_students}, headers=auth_headers)
reverted_students = next((s["value"] for s in safe_get("/companyprofile/settings").json() if s["key"] == "stat_students"), None)
print(f"4. [RESTORE] Dikembalikan ke nilai semula: \"{reverted_students}\"")
assert reverted_students == orig_students

print("\n" + "=" * 72)
print("=== KESIMPULAN: SELURUH 5 TEST MUTASI LIVE TERBUKTI SINKRON 100% ===")
print("=" * 72)
