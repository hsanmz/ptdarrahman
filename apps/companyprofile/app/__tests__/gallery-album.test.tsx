import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup, fireEvent } from '@testing-library/react'
import { useState } from 'react'
import { GalleryFormDialog } from '../admin/dashboard/gallery/GalleryFormDialog'
import GalleryAlbumModal from '../(main)/gallery/_components/GalleryAlbumModal'
import AdminToast from '../components/ui/AdminToast'
import AdminConfirm from '../components/ui/AdminConfirm'
import type { FormState } from '../admin/dashboard/_types'
import type { GalleryItem } from '../lib/types'
import { buildGalleryPayload, readGalleryForm } from '../admin/dashboard/gallery/gallery-form'

vi.mock('@/app/lib/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/app/lib/api')>()
  return {
    ...actual,
    uploadImage: vi.fn(async () => 'https://cdn.example.com/album-photo.jpg'),
    createItem: vi.fn(async () => ({})),
    updateItem: vi.fn(async () => ({})),
  }
})

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe('Gallery Album Feature — Admin Form', () => {
  it('dapat beralih antara Foto Biasa dan Album Foto di form admin', () => {
    function Harness() {
      const [formData, setFormData] = useState<FormState>({
        category: 'Kegiatan Santri',
        image: '',
        _c_title: 'Album Kegiatan Tahfidz',
        _c_desc: 'Dokumentasi kegiatan tasmi',
      })
      return (
        <>
          <AdminToast />
          <AdminConfirm />
          <GalleryFormDialog
            mode="create"
            activeTab="gallery"
            editingItem={null}
            formData={formData}
            setFormData={setFormData}
            onClose={vi.fn()}
            onSaved={vi.fn()}
          />
        </>
      )
    }

    render(<Harness />)

    // Periksa tombol pemilih tipe
    const singleBtn = screen.getByRole('button', { name: /Biasa \(Foto Tunggal\)/i })
    const albumBtn = screen.getByRole('button', { name: /Album \(Koleksi Foto\)/i })
    expect(singleBtn).toBeInTheDocument()
    expect(albumBtn).toBeInTheDocument()

    // Klik beralih ke Album
    fireEvent.click(albumBtn)

    // Label gambar berubah menjadi Foto Sampul Album dan muncul seksi Foto di Dalam Album
    expect(screen.getByText('Foto Sampul Album')).toBeInTheDocument()
    expect(screen.getByText('Foto di Dalam Album')).toBeInTheDocument()
  })

  it('buildGalleryPayload menyusun tipe album dan daftar gambar dengan benar', () => {
    const formData: FormState = {
      category: 'Acara & Perayaan',
      image: 'https://cdn.example.com/cover.jpg',
      _c_title: 'Wisuda 2026',
      _c_desc: 'Wisuda santri',
      _c_type: 'album',
      _c_images: [
        'https://cdn.example.com/p1.jpg',
        'https://cdn.example.com/p2.jpg',
      ],
    }

    const values = readGalleryForm(formData)
    expect(values.type).toBe('album')
    expect(values.images).toHaveLength(2)

    const payload = buildGalleryPayload({ formData })
    expect(payload.category).toBe('Acara & Perayaan')
    expect(payload.image).toBe('https://cdn.example.com/cover.jpg')

    const parsedContent = JSON.parse(payload.content as string)
    expect(parsedContent.type).toBe('album')
    expect(parsedContent.images).toEqual([
      'https://cdn.example.com/p1.jpg',
      'https://cdn.example.com/p2.jpg',
    ])
  })
})

describe('Gallery Album Feature — Public Modal View', () => {
  const sampleAlbum: GalleryItem = {
    id: 'alb-1',
    category: 'Kegiatan Santri',
    image: 'https://cdn.example.com/cover.jpg',
    content: {
      title: 'Album Kegiatan Santri Baru',
      desc: 'Momen orientasi dan kebersamaan santri baru.',
      type: 'album',
      images: [
        'https://cdn.example.com/cover.jpg',
        'https://cdn.example.com/foto-1.jpg',
        'https://cdn.example.com/foto-2.jpg',
      ],
    },
  }

  it('merender album view dengan judul, deskripsi, dan grid foto di dalam album', () => {
    const onClose = vi.fn()
    render(<GalleryAlbumModal album={sampleAlbum} onClose={onClose} />)

    expect(screen.getByText('Album Kegiatan Santri Baru')).toBeInTheDocument()
    expect(screen.getByText('Momen orientasi dan kebersamaan santri baru.')).toBeInTheDocument()
    expect(screen.getByText('Kembali ke Galeri')).toBeInTheDocument()

    // Tombol kembali memanggil onClose
    fireEvent.click(screen.getByText('Kembali ke Galeri'))
    expect(onClose).toHaveBeenCalled()
  })
})
