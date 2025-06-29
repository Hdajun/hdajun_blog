import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { Plugin } from 'prosemirror-state';
import ImageResizer from './ImageResizer';

interface UploadImageOptions {
  onUploadStart?: () => void;
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: Error) => void;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    uploadImage: {
      setImage: (options: { 
        src: string;
        width?: number;
        height?: number;
        tempId?: string;
      }) => ReturnType;
    };
  }
}

export const UploadImage = Node.create<UploadImageOptions>({
  name: 'uploadImage',

  addOptions() {
    return {
      onUploadStart: () => {},
      onUploadSuccess: () => {},
      onUploadError: () => {},
    };
  },

  group: 'block',

  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
        parseHTML: element => element.getAttribute('src'),
        renderHTML: attributes => {
          if (!attributes.src) {
            return {};
          }
          return { src: attributes.src };
        },
      },
      alt: {
        default: null,
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => {
          if (!attributes.alt) {
            return {};
          }
          return { alt: attributes.alt };
        },
      },
      width: {
        default: null,
        parseHTML: element => element.getAttribute('width'),
        renderHTML: attributes => {
          if (!attributes.width) {
            return {};
          }
          return { width: attributes.width };
        },
      },
      height: {
        default: null,
        parseHTML: element => element.getAttribute('height'),
        renderHTML: attributes => {
          if (!attributes.height) {
            return {};
          }
          return { height: attributes.height };
        },
      },
      tempId: {
        default: null,
        rendered: false,
      },
      nodeType: {
        default: 'uploadImage',
        parseHTML: () => 'uploadImage',
        renderHTML: () => ({ 'data-node-type': 'uploadImage' }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: element => {
          if (typeof element === 'string') return {};
          const el = element as HTMLElement;
          return {
            src: el.getAttribute('src'),
            alt: el.getAttribute('alt'),
            width: el.getAttribute('width'),
            height: el.getAttribute('height'),
            nodeType: 'uploadImage',
          };
        },
      },
      {
        tag: 'div[data-node-type="uploadImage"]',
        getAttrs: element => {
          if (typeof element === 'string') return {};
          const el = element as HTMLElement;
          const img = el.querySelector('img');
          if (!img) return {};
          return {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt'),
            width: img.getAttribute('width'),
            height: img.getAttribute('height'),
            nodeType: 'uploadImage',
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const { tempId, nodeType, ...attrs } = HTMLAttributes;
    return ['div', { 
      'data-node-type': 'uploadImage',
      class: 'react-renderer node-uploadImage',
    }, ['img', mergeAttributes(attrs)]];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizer);
  },

  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { ...options, nodeType: 'uploadImage' },
          });
        },
    };
  },

  addProseMirrorPlugins() {
    const editor = this.editor;
    const options = this.options;

    const uploadToCloudinary = async (file: File): Promise<{ url: string; width: number; height: number }> => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      },);

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      return {
        url: data.secure_url,
        width: data.width,
        height: data.height,
      };
    };

    const processImage = async (file: File, view: any) => {
      try {
        options.onUploadStart?.();
        const tempId = `upload-${Date.now()}`;

        // 创建临时预览
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64URL = e.target?.result as string;
          const img = new Image();
          img.onload = () => {
            const maxWidth = view.dom.clientWidth * 0.8;
            let width = img.width;
            let height = img.height;
            
            if (width > maxWidth) {
              const ratio = maxWidth / width;
              width = maxWidth;
              height = height * ratio;
            }

            editor.commands.setImage({
              src: base64URL,
              width: Math.round(width),
              height: Math.round(height),
              tempId,
            });
          };
          img.src = base64URL;
        };
        reader.readAsDataURL(file);

        // 上传到 Cloudinary
        const { url, width, height } = await uploadToCloudinary(file);

        // 更新图片为 Cloudinary URL
        const { tr } = view.state;
        let imageFound = false;
        view.state.doc.descendants((node: any, pos: number) => {
          if (node.type.name === 'uploadImage' && node.attrs.tempId === tempId) {
            imageFound = true;
            tr.setNodeAttribute(pos, 'src', url)
              .setNodeAttribute(pos, 'width', width)
              .setNodeAttribute(pos, 'height', height)
              .setNodeAttribute(pos, 'tempId', null);
            view.dispatch(tr);

            // 触发编辑器的 update 事件
            editor.commands.focus();
            const transaction = editor.state.tr.setMeta('addToHistory', false);
            editor.view.dispatch(transaction);
          }
        });

        if (imageFound) {
          options.onUploadSuccess?.(url);
        }
      } catch (error) {
        options.onUploadError?.(error as Error);
        console.error('Failed to process image:', error);
      }
    };

    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            const items = Array.from(event.clipboardData?.items || []);
            const image = items.find((item) => item.type.startsWith('image'));

            if (!image) {
              return false;
            }

            event.preventDefault();

            const file = image.getAsFile();
            if (!file) {
              return false;
            }

            processImage(file, view);
            return true;
          },

          handleDrop(view, event) {
            const hasFiles = event.dataTransfer?.files?.length;

            if (!hasFiles) {
              return false;
            }

            const images = Array.from(event.dataTransfer.files).filter((file) =>
              file.type.startsWith('image'),
            );

            if (images.length === 0) {
              return false;
            }

            event.preventDefault();

            images.forEach((file) => {
              processImage(file, view);
            });

            return true;
          },
        },
      }),
    ];
  },
});