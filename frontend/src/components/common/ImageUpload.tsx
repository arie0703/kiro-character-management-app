import React, { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  value?: string | null;
  onChange: (file: File | null, previewUrl: string | null) => void;
  disabled?: boolean;
  maxSize?: number; // MB
  acceptedTypes?: string[];
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  disabled = false,
  maxSize = 5, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  className = '',
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 画像リサイズ関数
  const resizeImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // 最大サイズを設定（800x800px）
        const maxWidth = 800;
        const maxHeight = 800;

        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
        }

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          } else {
            resolve(file);
          }
        }, file.type, 0.8); // 品質80%
      };

      img.src = URL.createObjectURL(file);
    });
  };

  // ファイル処理関数
  const processFile = useCallback(async (file: File) => {
    setError(null);

    // ファイルタイプチェック
    if (!acceptedTypes.includes(file.type)) {
      setError('対応していないファイル形式です。JPG、PNG、GIF、WebP形式の画像を選択してください。');
      return;
    }

    // ファイルサイズチェック
    if (file.size > maxSize * 1024 * 1024) {
      setError(`ファイルサイズは${maxSize}MB以下にしてください。`);
      return;
    }

    try {
      // 画像リサイズ
      const resizedFile = await resizeImage(file);

      // プレビューURL生成
      const reader = new FileReader();
      reader.onload = (e) => {
        const previewUrl = e.target?.result as string;
        onChange(resizedFile, previewUrl);
      };
      reader.readAsDataURL(resizedFile);
    } catch (err) {
      setError('画像の処理中にエラーが発生しました。');
      console.error('Image processing error:', err);
    }
  }, [acceptedTypes, maxSize, onChange]);

  // ファイル選択ハンドラー
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // ドラッグ&ドロップハンドラー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const imageFile = files.find(file => acceptedTypes.includes(file.type));

    if (imageFile) {
      processFile(imageFile);
    } else {
      setError('対応していないファイル形式です。画像ファイルをドラッグ&ドロップしてください。');
    }
  };

  // ファイル削除
  const handleRemove = () => {
    onChange(null, null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ファイル選択ダイアログを開く
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={className}>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${isDragOver
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {value ? (
          // プレビュー表示
          <div className="space-y-4">
            <div className="flex justify-center">
              <img
                src={value}
                alt="プレビュー"
                className="h-32 w-32 rounded-lg object-cover shadow-sm"
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                クリックまたはドラッグ&ドロップで画像を変更
              </p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove();
                }}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
                disabled={disabled}
              >
                画像を削除
              </button>
            </div>
          </div>
        ) : (
          // アップロードエリア
          <div className="space-y-4">
            <div className="flex justify-center">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                クリックまたはドラッグ&ドロップで画像をアップロード
              </p>
              <p className="text-xs text-gray-500">
                JPG、PNG、GIF、WebP形式、最大{maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 
