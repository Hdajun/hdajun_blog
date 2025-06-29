import { NodeViewWrapper } from '@tiptap/react';
import React, { useCallback, useRef, useState } from 'react';
import './ImageResizer.css';

interface ImageResizerProps {
  node: any;
  updateAttributes: (attrs: Record<string, any>) => void;
}

export default function ImageResizer({ node, updateAttributes }: ImageResizerProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [isResizing, setIsResizing] = useState(false);

  const onResizeStart = useCallback((e: React.MouseEvent, direction: 'left' | 'right') => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!imageRef.current) return;
    
    setIsResizing(true);
    const image = imageRef.current;
    const startX = e.clientX;
    const startWidth = image.width;
    const aspectRatio = image.naturalWidth / image.naturalHeight;

    const onMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      const delta = direction === 'right' ? currentX - startX : startX - currentX;
      const newWidth = Math.max(100, startWidth + delta);
      const newHeight = Math.round(newWidth / aspectRatio);

      updateAttributes({
        width: Math.round(newWidth),
        height: newHeight,
      });
    };

    const onMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [updateAttributes]);

  const isUploading = !!node.attrs.tempId;
  const wrapperClassName = `image-resizer${isUploading ? ' uploading' : ''}${isResizing ? ' resizing' : ''}`;

  return (
    <NodeViewWrapper className={wrapperClassName}>
      <div className="image-container">
        <img
          ref={imageRef}
          src={node.attrs.src}
          alt={node.attrs.alt || ''}
          width={node.attrs.width}
          height={node.attrs.height}
          draggable={false}
        />
        {!isUploading && (
          <>
            <div 
              className="resize-handle left"
              onMouseDown={(e) => onResizeStart(e, 'left')}
            />
            <div 
              className="resize-handle right"
              onMouseDown={(e) => onResizeStart(e, 'right')}
            />
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
}