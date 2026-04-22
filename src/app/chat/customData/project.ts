const project = `
### 广告科技-AI 广告原生平台 (2025.03 - 至今)
**项目介绍：** 蚂蚁数科线下的 RTA 广告投放管理平台，服务于运营/广告主/代理商多类角色，覆盖人群圈选、策略配置、实时竞价投放、效果监控、AIGC 素材生产、账号权限管控等全链路能力，实现精准投放与业务转化最大化。

**技术要点**
- 主技术栈：Bigfish + React + TypeScript + AntD 5.x，Infinity SDK + Tracer 搭建监控埋点
- 权限架构：设计多角色权限模型，抽象为 4 套配置矩阵，access 层将权限码展开为布尔映射实现页面级路由拦截
- 低代码引擎：基于 Apaasify Render 拉取远程 Schema 驱动渲染，MergePropsPlugin 注入运行时上下文，自研 20+ 业务组件注册设计器面板，实现列表页 100% 低代码搭建覆盖
- AIGC 素材生产：设计脚本→素材→分镜→编排→渲染五步工作流，集成 Nano Banana 生图 + Seedance 2.0 生视频，基于 Context 实现跨步骤状态共享与断点续作
- AI 辅助研发：为团队定制 AI 工具链，通过 /commands 封装高频指令，编写 Skills 和 Rules 规范 AI 输出质量与代码风格，推动 AI 辅助编码标准化落地

### POC 演示设计平台 (2024.12 - 至今)
**项目介绍：** 面向产品拓客场景的低代码原型搭建工具，自研 PPT 式画布编辑器引擎，支持通过上传图片、拖拽模板或 AI 自然语言生成三种方式快速搭建交互式产品演示 Demo。

**技术要点**
- 技术栈：Bigfish + React + TypeScript，自研画布引擎 apaasify-powerpoint-design，底层渲染基于 apaasify-render，截图使用 snapdom
- 画布编辑器核心：基于 Context 管理编辑器全局状态，实现 16:9 自适应画布、四层嵌套树形目录递归渲染与跨层级拖拽排序、ActionCircle 热区组件支持点击/定时/滚动三种触发模式、ZoomBox 区域裁剪支持等比缩放与边界约束
- AI 页面生成：集成 Claude/Gemini/Qwen 多模型，通过 SSE 流式接收输出并解析 genuiArtifact DSL 标签驱动动态 UI 渲染，结合 snapdom 全页截图压缩后上传 OSS 持久化
- 多端适配：支持 PC/Mobile/iPad 三端，预览层实现首屏 10 张图片预加载 + 交互懒加载的性能优化，移动端自动生成二维码扫码预览

### Communicate-UI + Apaasify-Web 组件库与搭建平台 (2025.03 - 至今)
**项目介绍：** 为联营平台低代码化提供底层支撑，包含物料组件库和可视化搭建平台两部分，组件采用运行时 + 设计态双模式架构，搭建平台基于 apaasify-core 引擎实现拖拽编辑与发布上下线全流程。

**技术要点**
- 技术栈：React + TypeScript，组件库通过 father 构建 ESM 产物 + dumi 生成文档站点，低代码引擎基于 apaasify-core
- 双模式架构：每个组件同时导出运行时实现和 \`.config\` 设计态 Schema，一套代码同时服务渲染和设计器属性编辑，组件接入低代码零额外成本
- 核心 ConfigTable 组件：支持 API / Mock / Props 三种数据源、列值映射、条件渲染、权限校验、批量操作，配套 6 个设计态配置面板
- useFetch 请求 Hook：实现 \`$store\`、\`$search\`、\`$record\`、\`$deps\` 四种动态参数协议和响应字段映射，支持嵌套 AND/OR 条件树驱动组件显隐与权限控制
`

export default project