'use client'

import { useEffect } from 'react';

interface Live2DWidgetProps {
  config?: {
    width?: number;
    height?: number;
    position?: 'right' | 'left';
    hOffset?: number;
    vOffset?: number;
    mobile?: {
      show: boolean;
      scale: number;
    };
  };
}

const Live2DWidget: React.FC<Live2DWidgetProps> = ({ config = {} }) => {
  useEffect(() => {
    // 只在客户端执行
    if (typeof window === 'undefined') return;

    // 按顺序加载所需的脚本
    const loadScripts = async () => {
      // 加载 Cubism 2 Core
      await loadScript('https://cdn.jsdelivr.net/gh/dylanNew/live2d/webgl/Live2D/lib/live2d.min.js');
      
      // 加载 Cubism 3+ Core
      await loadScript('https://cubism.live2d.com/sdk-web/cubismcore/live2dcubismcore.min.js');
      
      // 加载 PIXI
      await loadScript('https://cdn.jsdelivr.net/npm/pixi.js@5.3.3/dist/pixi.min.js');
      
      // 加载 Live2D Display
      await loadScript('https://cdn.jsdelivr.net/npm/pixi-live2d-display/dist/index.min.js');

      // 初始化模型
      initializeLive2D();
    };

    // 加载单个脚本的函数
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };

    // 初始化 Live2D 模型
    const initializeLive2D = () => {
      // 先删除所有已存在的容器
      const existingContainers = document.querySelectorAll('#live2d-container');
      existingContainers.forEach(container => container.remove());

      // 配置默认值
      const defaultConfig = {
        width: 200,
        height: 400,  // 增加容器高度以显示完整模型
        position: 'left',
        hOffset: 0,
        vOffset: 0,
        mobile: {
          show: false,
          scale: 0.5,
        },
        ...config
      };

      // 创建容器
      const container = document.createElement('div');
      container.id = 'live2d-container';
      container.style.position = 'fixed';
      container.style.right = '0';  // 调整右侧距离
      container.style.bottom = '0';
      container.style.zIndex = '999999';
      container.style.width = `${defaultConfig.width}px`;
      container.style.height = `${defaultConfig.height}px`;
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      container.style.alignItems = 'center';
      document.body.appendChild(container);

      // 创建 PIXI 应用
      const app = new (window as any).PIXI.Application({
        width: defaultConfig.width,
        height: defaultConfig.height,
        transparent: true,
        autoStart: true,
        resolution: window.devicePixelRatio || 2, // 使用设备像素比或至少2倍分辨率
        antialias: true, // 启用抗锯齿
        autoDensity: true, // 自动处理高DPI显示
      });

      // 设置视图样式以确保清晰度
      app.view.style.width = `${defaultConfig.width}px`;
      app.view.style.height = `${defaultConfig.height}px`;

      container.appendChild(app.view);

      // 设置模型加载器的基础路径
      (window as any).PIXI.live2d.Live2DModel.from('/live2d/rice_pro_t03/rice_pro_t03.model3.json', {
        autoInteract: true,
        autoUpdate: true,
        antialias: true, // 为模型启用抗锯齿
        resizeToFrame: true, // 自动调整大小以适应框架
        pixelRatio: window.devicePixelRatio || 2, // 使用设备像素比
      }).then((model: any) => {
        app.stage.addChild(model);

        // 调整模型位置和大小
        model.scale.set(0.1); // 稍微增加模型大小
        // 将模型放置在容器中心，稍微向上调整
        model.x = defaultConfig.width / 6;
        model.y = (defaultConfig.height / 2) + 50; // 向下移动一点以显示完整模型
        model.anchor.set(0.5, 0.5);

        // 启用模型的抗锯齿
        if (model.filters) {
          model.filters = [...model.filters];
        }

        // 添加拖拽功能
        model.draggable = true;

        // 添加点击交互
        model.on('hit', (hitAreas: string[]) => {
          if (hitAreas.includes('Body')) {
            console.log('Touched body');
          }
        });
      }).catch((error: Error) => {
        console.error('Failed to load Live2D model:', error);
      });
    };

    // 开始加载脚本
    loadScripts().catch(error => {
      console.error('Failed to load required scripts:', error);
    });

    // 清理函数
    return () => {
      // 删除所有已存在的容器
      const containers = document.querySelectorAll('#live2d-container');
      containers.forEach(container => container.remove());

      // 移除所有相关的脚本
      const scripts = document.querySelectorAll('script[src*="live2d"], script[src*="pixi"]');
      scripts.forEach(script => script.remove());
    }
  }, [JSON.stringify(config)])

  return null
}

export default Live2DWidget;