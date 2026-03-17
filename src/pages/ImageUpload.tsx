import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Upload, X, ImageIcon } from 'lucide-react';
import API from '@/services/api';
import { FormSelect } from '@/components/ui/FormSelect';
import { FormCard } from '@/components/ui/FormCard';
import { SubmitButton } from '@/components/ui/SubmitButton';

const cityOptions = [
  { value: 'Hyderabad', label: 'Hyderabad' },
  { value: 'Khammam', label: 'Khammam' },
];

const ImageUploadPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [city, setCity] = useState('Hyderabad');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selected: File | null) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      toast.error('File must be under 10MB');
      return;
    }
    setFile(selected);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(selected);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    formData.append('city', city);

    try {
      await API.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Image uploaded successfully!');
      clearFile();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      <header className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight">Upload Image</h1>
        <p className="text-muted-foreground mt-1.5">Upload building photos or assets.</p>
      </header>

      <FormCard title="Asset Upload">
        <div className="space-y-5">
          <FormSelect
            label="Target City"
            options={cityOptions}
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />

          <div
            className="group relative border-2 border-dashed border-border rounded-xl p-8 transition-base hover:border-primary/50 flex flex-col items-center justify-center bg-secondary/30 cursor-pointer min-h-[200px]"
            onClick={() => inputRef.current?.click()}
          >
            {preview ? (
              <div className="relative">
                <img src={preview} alt="Preview" className="max-h-64 rounded-lg shadow-sm" />
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); clearFile(); }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-base"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                <ImageIcon className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">Click to upload building photo</p>
                <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
            />
          </div>

          <SubmitButton
            fullWidth
            onClick={handleUpload}
            loading={loading}
            disabled={!file}
          >
            <Upload className="w-4 h-4" />
            Upload Image
          </SubmitButton>
        </div>
      </FormCard>
    </div>
  );
};

export default ImageUploadPage;
