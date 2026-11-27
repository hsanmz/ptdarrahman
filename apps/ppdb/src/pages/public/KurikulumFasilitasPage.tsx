import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FALLBACK_PROGRAMS,
  FALLBACK_FACILITIES,
  type ProgramItem,
  type FacilityItem,
} from '@/services/cpDataService'
import {
  PROGRAM_HARIAN,
  PRESTASI_SANTRI,
  EKSKUL_OUTING,
} from '@/data/admissionData'
import { Button } from '@/components/ui'
import {
  BookOpen, Building2, CheckCircle2, Award, Sparkles, Clock, Layers,
  Laptop, Moon, Home, Trophy, UserPlus, LogIn, Sunrise, Sun, Sunset,
  Compass, Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

type TabType = 'programs' | 'harian' | 'prestasi' | 'ekskul' | 'facilities'

export default function KurikulumFasilitasPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<TabType>('programs')
  const [facilityCategory, setFacilityCategory] = useState<string>('all')

  const programs: ProgramItem[] = FALLBACK_PROGRAMS
  const facilities: FacilityItem[] = FALLBACK_FACILITIES

  const facilityCategories = [
    { id: 'all', label: 'Semua Fasilitas', icon: Building2 },
    { id: 'tech', label: 'Teknologi & Lab', icon: Laptop },
    { id: 'worship', label: 'Musholla & Halaqah', icon: Moon },
    { id: 'boarding', label: 'Asrama Mukim', icon: Home },
    { id: 'academic', label: 'Ruang Kelas & Aula', icon: BookOpen },
    { id: 'sports', label: 'Olahraga & Rooftop', icon: Trophy },
  ]

  const filteredFacilities = facilities.filter((fac) => {
    if (facilityCategory === 'all') return true
    return fac.category === facilityCategory
  })

  // Grouping helper for Program Harian
  const getTimeCategoryIcon = (category: string) => {
    switch (category) {
      case 'Dini Hari':
        return Moon
      case 'Subuh':
        return Sunrise
      case 'Pagi':
        return Sun
      case 'Siang':
        return Sun
      case 'Sore':
        return Sunset
      case 'Malam':
        return Moon
      default:
        return Clock
    }
  }

  return (
    <div className="pt-24 pb-20">
      {/* ── Page Header ── */}
      <section className="relative overflow-hidden px-4 py-12 bg-gradient-to-b from-emerald-50/50 via-white to-background border-b border-slate-100">
        <div className="container mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3.5 py-1 text-xs font-bold text-emerald-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Jenjang SMK (3 Tahun) — Khusus Lulusan SMP / MTs Sederajat</span>
          </span>

          <h1 className="mt-4 font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
            Kurikulum Terpadu &amp; Fasilitas Modern
          </h1>

          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
            Pendidikan kejuruan SMK 3 tahun berbasis pesantren bagi calon santri putra lulusan SMP / MTs / sederajat. Menghadirkan perpaduan harmonis antara kedalaman hafalan Al-Qur'an 30 juz mutqin, adab kemandirian asrama, torehan prestasi kejuaraan, dan rekayasa teknologi digital modern di Pesantren Tahfidz Qur'an dan Digital Ar-Rahman.
          </p>

          {/* 5 Tab Navigation Switcher */}
          <div className="mt-8 flex justify-center overflow-x-auto pb-2">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-100/90 border border-slate-200 gap-1">
              <button
                onClick={() => setActiveTab('programs')}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                  activeTab === 'programs'
                    ? 'bg-white text-emerald-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Kurikulum ({programs.length})
              </button>

              <button
                onClick={() => setActiveTab('harian')}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                  activeTab === 'harian'
                    ? 'bg-white text-emerald-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Program Harian ({PROGRAM_HARIAN.length})
              </button>

              <button
                onClick={() => setActiveTab('prestasi')}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                  activeTab === 'prestasi'
                    ? 'bg-white text-emerald-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Prestasi Santri ({PRESTASI_SANTRI.length})
              </button>

              <button
                onClick={() => setActiveTab('ekskul')}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                  activeTab === 'ekskul'
                    ? 'bg-white text-emerald-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Ekskul &amp; Outing ({EKSKUL_OUTING.length})
              </button>

              <button
                onClick={() => setActiveTab('facilities')}
                className={cn(
                  'rounded-xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all whitespace-nowrap',
                  activeTab === 'facilities'
                    ? 'bg-white text-emerald-primary shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                )}
              >
                Fasilitas ({facilities.length})
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Body ── */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        {/* ── Tab 1: Kurikulum & 5 Pilar ── */}
        {activeTab === 'programs' && (
          <div className="space-y-10">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                5 Pilar Kurikulum Terintegrasi
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Disusun khusus agar santri menyelesaikan hafalan Al-Qur'an 30 juz mutqin sekaligus memiliki kecakapan komputasi yang relevan di era industri teknologi modern.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {programs.map((prog, idx) => (
                <div
                  key={prog.id || idx}
                  className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all duration-300"
                >
                  <div className="p-6 sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
                        <Award className="h-3.5 w-3.5" />
                        <span>Pilar {idx + 1}</span>
                      </span>

                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {prog.duration}
                        </span>
                        <span className="h-3 w-px bg-slate-200" />
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-slate-400" />
                          {prog.level}
                        </span>
                      </div>
                    </div>

                    <h3 className="font-heading text-xl sm:text-2xl font-extrabold text-slate-900">
                      {prog.title}
                    </h3>
                    <p className="mt-1 text-xs sm:text-sm font-semibold text-emerald-primary">
                      {prog.tagline}
                    </p>

                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                      {prog.desc}
                    </p>

                    {/* Highlights & Curriculum Grid */}
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
                      {/* Highlights */}
                      <div className="rounded-2xl bg-emerald-50/50 p-4 border border-emerald-100/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
                          Keunggulan &amp; Pengalaman Santri
                        </h4>
                        <ul className="space-y-2">
                          {prog.highlights.map((hl, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Curriculum Modules */}
                      <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200/60">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5 text-slate-500" />
                          Fokus Materi &amp; Praktik Harian
                        </h4>
                        <ul className="space-y-2">
                          {prog.curriculum.map((cm, i) => (
                            <li key={i} className="flex items-start gap-2 text-xs sm:text-sm text-slate-700">
                              <span className="h-1.5 w-1.5 rounded-full bg-gold-accent mt-2 shrink-0" />
                              <span>{cm}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Target Output */}
                    <div className="mt-4 rounded-xl bg-amber-50/60 p-3.5 border border-amber-200/60 flex items-center gap-3">
                      <Trophy className="h-5 w-5 text-gold-dark shrink-0" />
                      <div className="text-xs text-amber-950">
                        <strong className="font-bold">Target Capaian Santri: </strong>
                        {prog.outcomes.join(' ')}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 2: Program Harian (18 Aktivitas) ── */}
        {activeTab === 'harian' && (
          <div className="space-y-10">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                <Clock className="h-3.5 w-3.5" />
                Rutinitas 24 Jam Penuh Berkah
              </span>
              <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Program Harian Santri PTDARRAHMAN
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Jadwal harian dirancang teratur dari sebelum fajar hingga istirahat malam guna membangun kedisiplinan ibadah, kejernihan menghafal Al-Qur'an, dan produktivitas komputasi santri.
              </p>
            </div>

            {/* Tabel Jadwal Program Harian */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Tabel Matriks Rutinitas Harian
                  </h3>
                  <p className="text-xs text-slate-500">
                    Jadwal 18 aktivitas santri secara runtut dari dini hari hingga malam.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  18 Aktivitas Baku
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-14">No</th>
                      <th className="px-4 py-3 w-32">Waktu</th>
                      <th className="px-4 py-3 w-28">Sesi</th>
                      <th className="px-4 py-3">Nama Kegiatan</th>
                      <th className="px-4 py-3">Fokus &amp; Deskripsi</th>
                      <th className="px-4 py-3 w-36 text-center">Kategori</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {PROGRAM_HARIAN.map((item) => (
                      <tr key={item.id} className="hover:bg-emerald-50/40 transition-colors">
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">
                          {item.number}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-emerald-primary whitespace-nowrap">
                          {item.timeRange}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                          {item.timeCategory}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {item.title}
                        </td>
                        <td className="px-4 py-3 text-slate-600 leading-relaxed text-xs">
                          {item.desc}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            {item.tag}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* List Kartu 18 Kegiatan Harian */}
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-heading text-base font-bold text-slate-900">
                  Kartu Aktivitas Harian
                </h3>
                <span className="text-xs text-slate-400">Tampilan Visual Rinci</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {PROGRAM_HARIAN.map((item) => {
                  const IconComponent = getTimeCategoryIcon(item.timeCategory)
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-primary text-xs font-bold font-mono border border-emerald-100 group-hover:bg-emerald-primary group-hover:text-white transition-colors">
                            {item.number}
                          </span>
                          <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600">
                            <IconComponent className="h-3 w-3 text-slate-500" />
                            {item.timeRange}
                          </span>
                        </div>

                        <h3 className="font-heading text-base font-bold text-slate-900 group-hover:text-emerald-primary transition-colors">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                          {item.desc}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-sm">
                          {item.tag}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {item.timeCategory}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 3: Prestasi Santri ── */}
        {activeTab === 'prestasi' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3.5 py-1 text-xs font-bold text-amber-900">
                <Trophy className="h-3.5 w-3.5 text-amber-600" />
                Torehan Prestasi Santri Baru
              </span>
              <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Bukti Nyata Prestasi Santri PTDARRAHMAN
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Keseimbangan pembinaan Al-Qur'an, sains komputasi, dan bahasa asing terbukti mencetak santri berprestasi di tingkat kejuaraan dan olimpiade bergengsi.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {PRESTASI_SANTRI.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-7 shadow-sm hover:shadow-xl hover:border-amber-200 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold', item.badgeBg, item.badgeText)}>
                        <Award className={cn('h-4 w-4', item.iconColor)} />
                        {item.achievement}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        Medali {item.medal}
                      </span>
                    </div>

                    <h3 className="font-heading text-xl font-extrabold text-slate-900">
                      {item.name}
                    </h3>
                    <div className="mt-1 text-xs sm:text-sm font-semibold text-emerald-700">
                      Bidang Lomba: {item.competitionField}
                    </div>

                    <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-medium text-slate-600">{item.eventTitle}</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600">
                      <Star className="h-3.5 w-3.5 fill-amber-500" />
                      Terverifikasi
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab 4: Ekskul & Outing Class (Tabel) ── */}
        {activeTab === 'ekskul' && (
          <div className="space-y-8">
            <div className="text-center max-w-2xl mx-auto mb-8">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-3.5 py-1 text-xs font-bold text-sky-800">
                <Compass className="h-3.5 w-3.5 text-sky-600" />
                Eksplorasi Minat &amp; Bakat Santri
              </span>
              <h2 className="mt-2 font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Ekstrakurikuler &amp; Outing Class
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Kegiatan santri di luar kelas yang memupuk kebersamaan, kecerdasan motorik, kebugaran sunnah, dan wawasan tadabbur alam secara seimbang.
              </p>
            </div>

            {/* Tabel Ekskul & Outing Class */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">
                    Tabel Program Ekstrakurikuler &amp; Outing Class
                  </h3>
                  <p className="text-xs text-slate-500">
                    Pilihan kegiatan olahraga, seni islami, outing class, dan tadabbur alam santri.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-sky-100 text-sky-800">
                  {EKSKUL_OUTING.length} Program Pilihan
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100/70 text-slate-600 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-14">No</th>
                      <th className="px-4 py-3 w-44">Nama Kegiatan</th>
                      <th className="px-4 py-3 w-48">Kategori</th>
                      <th className="px-4 py-3">Deskripsi &amp; Manfaat Bagi Santri</th>
                      <th className="px-4 py-3 w-36 text-center">Status Bimbingan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {EKSKUL_OUTING.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-sky-50/30 transition-colors">
                        <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-500">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 text-sm whitespace-nowrap">
                          {item.name}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className={cn('text-[11px] font-bold px-2.5 py-0.5 rounded-full border', item.badgeColor)}>
                            {item.category}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-600 text-xs sm:text-sm leading-relaxed">
                          {item.desc}
                        </td>
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Terbimbing</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab 5: Sarana & Fasilitas Sekolah ── */}
        {activeTab === 'facilities' && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto mb-8">
              <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900">
                Sarana Pendukung Belajar Kondusif
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Fasilitas dirancang untuk kenyamanan ibadah, kebersihan mukim berasrama, serta ruang praktikum teknologi yang memadai.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pb-4">
              {facilityCategories.map((cat) => {
                const Icon = cat.icon
                const isSelected = facilityCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setFacilityCategory(cat.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all',
                      isSelected
                        ? 'bg-emerald-primary text-white shadow-sm'
                        : 'bg-white border border-slate-200 text-slate-600 hover:border-emerald-300'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>

            {/* Facilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredFacilities.map((fac) => (
                <div
                  key={fac.id}
                  className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Facility Image */}
                    <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                      <img
                        src={fac.image}
                        alt={fac.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {fac.floor && (
                        <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[11px] font-bold text-white">
                          {fac.floor}
                        </span>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-heading text-lg font-bold text-slate-900">
                        {fac.name}
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {fac.desc}
                      </p>

                      {/* Features */}
                      <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                        {fac.features.map((feat, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-primary shrink-0" />
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── CTA Banner ── */}
        <div className="mt-16 rounded-3xl bg-gradient-to-r from-emerald-900 to-emerald-700 p-8 sm:p-10 text-white text-center shadow-xl">
          <h3 className="font-heading text-xl sm:text-3xl font-extrabold">
            Ingin Melihat Langsung Fasilitas &amp; Aktivitas Santri Kami?
          </h3>
          <p className="mt-2 text-xs sm:text-base text-emerald-100 max-w-xl mx-auto">
            Ayah &amp; Bunda dapat mengikuti jadwal observasi dan silaturahmi langsung dengan pengasuh pesantren saat proses seleksi berlangsung.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={() => navigate('/register')}
              className="rounded-full bg-gold-accent px-7 py-3 text-sm font-bold text-emerald-950 shadow-md hover:bg-gold-light"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Daftar Santri Baru
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/auth/login')}
              className="rounded-full border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Masuk / Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
