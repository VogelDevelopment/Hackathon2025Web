// UserCertificateUploadForm.tsx - User can upload their URL for a certificate type
import { Button } from '@/components/ui/button';
import { Certificate } from '@/types';
import { useForm } from '@inertiajs/react';


export function UserCertificateUploadForm({ certificates }: { certificates: Certificate[] }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    certificate_id: '',
    url: '',
  })
  return (
    <form
      onSubmit={e => {
        e.preventDefault()
        post('/profile/certificate-upload', {
          onSuccess: () => reset(),
        })
      }}
      className="flex flex-col gap-2"
    >
      <select
        value={data.certificate_id}
        onChange={e => setData('certificate_id', e.target.value)}
        required
        className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-100"
      >
        <option value="">Bitte wählen…</option>
        {certificates.map(cert => (
          <option key={cert.id} value={cert.id}>{cert.name}</option>
        ))}
      </select>
      <input
        type="url"
        required
        value={data.url}
        onChange={e => setData('url', e.target.value)}
        className="border rounded px-2 py-1 dark:bg-gray-700 dark:text-gray-100"
        placeholder="Link zu deinem Zertifikatsnachweis"
      />
      <Button type="submit" disabled={processing}>
        Einreichen
      </Button>
      {errors.url && <p className="text-sm text-red-600">{errors.url}</p>}
      {errors.certificate_id && <p className="text-sm text-red-600">{errors.certificate_id}</p>}
    </form>
  )
}
