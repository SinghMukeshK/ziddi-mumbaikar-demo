'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import { X, RotateCcw, RotateCw, ZoomIn, ZoomOut, FlipHorizontal, FlipVertical, Check, RefreshCw } from 'lucide-react'

interface ImageEditorProps {
    file: File
    onSave: (editedFile: File) => void
    onCancel: () => void
    aspectRatio?: number
}

// Renders the natural image with transforms onto a canvas and returns it as a data URL
function renderTransformedImage(
    image: HTMLImageElement,
    rotation: number,
    zoom: number,
    flipH: boolean,
    flipV: boolean
): HTMLCanvasElement {
    const natW = image.naturalWidth
    const natH = image.naturalHeight

    // After rotation, the bounding box dimensions change
    const rad = (rotation * Math.PI) / 180
    const cos = Math.abs(Math.cos(rad))
    const sin = Math.abs(Math.sin(rad))
    const boundW = Math.ceil((natW * cos + natH * sin) * zoom)
    const boundH = Math.ceil((natW * sin + natH * cos) * zoom)

    const canvas = document.createElement('canvas')
    canvas.width = boundW
    canvas.height = boundH

    const ctx = canvas.getContext('2d')!
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Translate to center, apply transforms, draw
    ctx.translate(boundW / 2, boundH / 2)
    ctx.rotate(rad)
    ctx.scale(flipH ? -zoom : zoom, flipV ? -zoom : zoom)
    ctx.drawImage(image, -natW / 2, -natH / 2, natW, natH)

    return canvas
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
    return centerCrop(
        makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
        mediaWidth,
        mediaHeight
    )
}

export default function ImageEditor({ file, onSave, onCancel, aspectRatio = 16 / 9 }: ImageEditorProps) {
    const [imgSrc, setImgSrc] = useState('')                    // original file data URL
    const [previewSrc, setPreviewSrc] = useState('')            // transformed preview data URL
    const [crop, setCrop] = useState<Crop>()
    const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
    const [rotation, setRotation] = useState(0)
    const [zoom, setZoom] = useState(1)
    const [flipH, setFlipH] = useState(false)
    const [flipV, setFlipV] = useState(false)
    const [saving, setSaving] = useState(false)

    const naturalImgRef = useRef<HTMLImageElement>(null)  // hidden, loads original file
    const previewImgRef = useRef<HTMLImageElement>(null)  // visible inside ReactCrop
    const canvasRef = useRef<HTMLCanvasElement>(null)

    // Load file as data URL
    useEffect(() => {
        const reader = new FileReader()
        reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''))
        reader.readAsDataURL(file)
    }, [file])

    // Re-render the transformed preview whenever transforms change
    const updatePreview = useCallback(() => {
        const img = naturalImgRef.current
        if (!img || !img.complete || img.naturalWidth === 0) return

        const transformed = renderTransformedImage(img, rotation, zoom, flipH, flipV)
        setPreviewSrc(transformed.toDataURL('image/jpeg', 0.95))

        // Reset crop to center of the new preview dimensions
        setCrop(centerAspectCrop(transformed.width, transformed.height, aspectRatio))
        setCompletedCrop(undefined)
    }, [rotation, zoom, flipH, flipV, aspectRatio])

    // When the hidden natural image loads, trigger first preview render
    const onNaturalImageLoad = useCallback(() => {
        updatePreview()
    }, [updatePreview])

    // Re-render preview whenever transforms change (after initial load)
    useEffect(() => {
        if (naturalImgRef.current?.complete && naturalImgRef.current.naturalWidth > 0) {
            updatePreview()
        }
    }, [rotation, zoom, flipH, flipV, updatePreview])

    const onPreviewImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth: w, naturalHeight: h } = e.currentTarget
        setCrop(centerAspectCrop(w, h, aspectRatio))
    }, [aspectRatio])

    const handleRotate = (dir: 'cw' | 'ccw') => {
        setRotation(r => (r + (dir === 'cw' ? 90 : -90) + 360) % 360)
    }

    const handleReset = () => {
        setRotation(0)
        setZoom(1)
        setFlipH(false)
        setFlipV(false)
    }

    const handleSave = async () => {
        if (!previewImgRef.current || !canvasRef.current || !completedCrop) return
        setSaving(true)

        const previewImg = previewImgRef.current
        const canvas = canvasRef.current
        const crop = completedCrop

        // Scale from displayed preview size → actual preview canvas size
        const scaleX = previewImg.naturalWidth / previewImg.width
        const scaleY = previewImg.naturalHeight / previewImg.height

        const srcX = crop.x * scaleX
        const srcY = crop.y * scaleY
        const srcW = crop.width * scaleX
        const srcH = crop.height * scaleY

        canvas.width = Math.round(srcW)
        canvas.height = Math.round(srcH)

        const ctx = canvas.getContext('2d')!
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = 'high'

        // Draw only the cropped region from the preview image
        ctx.drawImage(previewImg, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH)

        canvas.toBlob(
            (blob) => {
                if (!blob) { setSaving(false); return }
                const editedFile = new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() })
                onSave(editedFile)
                setSaving(false)
            },
            'image/jpeg',
            0.92
        )
    }

    const controlBtn = (onClick: () => void, icon: React.ReactNode, label: string, active = false) => (
        <button
            type="button"
            onClick={onClick}
            title={label}
            className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${active
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            {/* Hidden natural image — used only for rendering transforms */}
            {imgSrc && (
                <img
                    ref={naturalImgRef}
                    src={imgSrc}
                    alt=""
                    onLoad={onNaturalImageLoad}
                    className="hidden"
                />
            )}

            <div className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">

                {/* Header */}
                <div className="bg-navy-900 px-8 py-5 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="text-white font-black text-lg tracking-tight">Edit Image</h3>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                            Step 1: Rotate/Flip/Zoom → Step 2: Crop
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Crop Area — always shows the already-transformed image */}
                <div className="flex-1 overflow-auto bg-gray-950 flex items-center justify-center p-6 min-h-0">
                    {previewSrc ? (
                        <ReactCrop
                            crop={crop}
                            onChange={(_, percentCrop) => setCrop(percentCrop)}
                            onComplete={(c) => setCompletedCrop(c)}
                            aspect={aspectRatio}
                            minWidth={50}
                            minHeight={50}
                        >
                            <img
                                ref={previewImgRef}
                                src={previewSrc}
                                alt="Transformed preview"
                                onLoad={onPreviewImageLoad}
                                style={{
                                    maxHeight: '50vh',
                                    maxWidth: '100%',
                                    display: 'block',
                                    objectFit: 'contain',
                                }}
                            />
                        </ReactCrop>
                    ) : (
                        <div className="flex flex-col items-center gap-3 text-white/40">
                            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-bold uppercase tracking-widest">Loading image…</span>
                        </div>
                    )}
                </div>

                {/* Controls */}
                <div className="bg-white border-t border-gray-100 px-6 py-5 flex-shrink-0">
                    {/* Zoom Slider */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Zoom</span>
                            <span className="text-[10px] font-bold text-primary-500">{(zoom * 100).toFixed(0)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <ZoomOut className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <input
                                type="range"
                                min={0.5}
                                max={3}
                                step={0.05}
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 h-2 rounded-full accent-primary-500 cursor-pointer"
                            />
                            <ZoomIn className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        </div>
                    </div>

                    {/* Rotation Slider */}
                    <div className="mb-5">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Rotation</span>
                            <span className="text-[10px] font-bold text-primary-500">{rotation}°</span>
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={359}
                            step={1}
                            value={rotation}
                            onChange={(e) => setRotation(parseInt(e.target.value))}
                            className="w-full h-2 rounded-full accent-primary-500 cursor-pointer"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                        {controlBtn(() => handleRotate('ccw'), <RotateCcw className="w-4 h-4" />, 'CCW')}
                        {controlBtn(() => handleRotate('cw'), <RotateCw className="w-4 h-4" />, 'CW')}
                        {controlBtn(() => setFlipH(f => !f), <FlipHorizontal className="w-4 h-4" />, 'Flip H', flipH)}
                        {controlBtn(() => setFlipV(f => !f), <FlipVertical className="w-4 h-4" />, 'Flip V', flipV)}
                        {controlBtn(handleReset, <RefreshCw className="w-4 h-4" />, 'Reset')}

                        <div className="flex-1" />

                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold text-xs uppercase tracking-widest hover:bg-gray-200 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || !completedCrop}
                            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-primary-500 text-white font-bold text-xs uppercase tracking-widest hover:bg-primary-600 transition-all shadow-lg shadow-primary-500/25 disabled:opacity-50"
                        >
                            {saving ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <Check className="w-4 h-4" />
                            )}
                            Apply & Use
                        </button>
                    </div>
                </div>

                {/* Hidden canvas for final export */}
                <canvas ref={canvasRef} className="hidden" />
            </div>
        </div>
    )
}
