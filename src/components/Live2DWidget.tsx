"use client";

import { useEffect } from "react";

interface Live2DWidgetProps {
  config?: {
    width?: number;
    height?: number;
    position?: "right" | "left";
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
    // 设备检测函数
    const isMobileDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobile = /iphone|ipod|android|blackberry|windows phone/g.test(
        userAgent
      );
      const isTablet = /ipad/g.test(userAgent);

      // 如果是手机则返回true，iPad返回false
      return isMobile && !isTablet;
    };

    // 只在客户端执行，并且不在手机上显示
    if (typeof window === "undefined" || isMobileDevice()) return;

    // 按顺序加载所需的脚本
    const loadScripts = async () => {
      // 加载 Cubism 2 Core
      await loadScript("/lib/live2d.min.js");

      // 加载 Cubism 3+ Core
      await loadScript("/lib/live2dcubismcore.min.js");

      // 加载 PIXI
      await loadScript("/lib/pixi.min.js");

      // 加载 Live2D Display
      await loadScript("/lib/pixi-live2d-display.min.js");

      // 初始化模型
      initializeLive2D();
    };

    // 加载单个脚本的函数
    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        // 检查是否已经加载过
        if (document.querySelector(`script[src="${src}"]`)) {
          resolve();
          return;
        }

        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () =>
          reject(new Error(`Failed to load script: ${src}`));
        document.body.appendChild(script);
      });
    };

    // 初始化 Live2D 模型
    const initializeLive2D = () => {
      // 先删除所有已存在的容器
      const existingContainers = document.querySelectorAll("#live2d-container");
      existingContainers.forEach((container) => container.remove());

      // 配置默认值
      const defaultConfig = {
        width: 200,
        height: 400,
        position: "left",
        hOffset: 0,
        vOffset: 0,
        mobile: {
          show: false,
          scale: 0.5,
        },
        ...config,
      };

      // 创建容器
      const container = document.createElement("div");
      container.id = "live2d-container";
      container.style.position = "fixed";
      container.style.right = "-36px";
      container.style.bottom = "0";
      container.style.zIndex = "999999";
      container.style.width = `${defaultConfig.width}px`;
      container.style.height = `${defaultConfig.height}px`;
      container.style.display = "flex";
      container.style.justifyContent = "center";
      container.style.alignItems = "center";
      document.body.appendChild(container);

      // 检查 PIXI 是否已加载
      if (!(window as any).PIXI) {
        console.error("PIXI not loaded");
        return;
      }

      // 创建 PIXI 应用
      const app = new (window as any).PIXI.Application({
        width: defaultConfig.width,
        height: defaultConfig.height,
        transparent: true,
        autoStart: true,
        resolution: window.devicePixelRatio || 2,
        antialias: true,
        autoDensity: true,
      });

      app.view.style.width = `${defaultConfig.width}px`;
      app.view.style.height = `${defaultConfig.height}px`;

      container.appendChild(app.view);

      // 设置模型加载器的基础路径
      (window as any)?.PIXI?.live2d?.Live2DModel?.from(
        "/live2d/rice_pro_t03/rice_pro_t03.model3.json",
        {
          autoInteract: true,
          autoUpdate: true,
          antialias: true,
          resizeToFrame: true,
          pixelRatio: window.devicePixelRatio || 2,
        }
      )
        .then((model: any) => {
          app.stage.addChild(model);

          model.scale.set(0.1);
          model.x = defaultConfig.width / 6;
          model.y = defaultConfig.height / 2 + 50;
          model.anchor.set(0.5, 0.5);

          if (model.filters) {
            model.filters = [...model.filters];
          }

          model.draggable = true;

          model.on("hit", (hitAreas: string[]) => {
            if (hitAreas.includes("Body")) {
              console.log("Touched body");
            }
          });
        })
        .catch((error: Error) => {
          console.error("Failed to load Live2D model:", error);
        });
    };

    // 开始加载脚本
    loadScripts().catch((error) => {
      console.error("Failed to load required scripts:", error);
    });

    // 清理函数
    return () => {
      const containers = document.querySelectorAll("#live2d-container");
      containers.forEach((container) => container.remove());

      // 注意：这里不再移除脚本，因为它们可能被其他组件使用
      // 如果需要移除，可以添加特定的标记来识别这些脚本
    };
  }, [JSON.stringify(config)]);

  return null;
};

export default Live2DWidget;
