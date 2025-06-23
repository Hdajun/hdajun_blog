import type { QuestionCategory, Difficulty } from "@/types/question";

export const questionCategories: QuestionCategory[] = [
  {
    value: "html-css",
    label: "HTML & CSS",
    description: "HTML5、CSS3、响应式设计、布局技巧等",
  },
  {
    value: "js-basics",
    label: "JS 基础",
    description: "JavaScript 核心概念、ES6+特性、异步编程等",
  },
  {
    value: "code-writing",
    label: "手写代码",
    description: "手写 Promise、防抖节流、工具函数等",
  },
  {
    value: "algorithm",
    label: "算法",
    description: "数据结构、常见算法、算法设计等",
  },
  {
    value: "typescript",
    label: "TS 类型",
    description: "TypeScript 类型系统、类型体操、高级类型等",
  },
  {
    value: "react-usage",
    label: "React 使用",
    description: "React 基础用法、Hooks、组件设计等",
  },
  {
    value: "react-principle",
    label: "React 原理",
    description: "React 架构原理、Fiber、调度机制等",
  },
  {
    value: "engineering",
    label: "前端工程化",
    description: "构建工具、CI/CD、代码规范、性能优化等",
  },
  {
    value: "mini-program",
    label: "小程序",
    description: "微信小程序、跨端开发、框架选型等",
  },
  {
    value: "nodejs",
    label: "Node.js",
    description: "后端开发、Express/Koa、数据库操作等",
  },
  {
    value: "http-network",
    label: "HTTP 网络请求",
    description: "HTTP 协议、Ajax、Fetch、axios 等",
  },
  {
    value: "vue-usage",
    label: "Vue 使用",
    description: "Vue 基础用法、组件开发、状态管理等",
  },
  {
    value: "vue-principle",
    label: "Vue 原理",
    description: "Vue 响应式原理、虚拟 DOM、编译原理等",
  },
  {
    value: "project-challenges",
    label: "项目难点",
    description: "实际项目中遇到的技术难点和解决方案",
  },
  {
    value: "code-reading",
    label: "读代码",
    description: "源码阅读、代码分析、设计模式等",
  },
  {
    value: "computer-basics",
    label: "计算机基础",
    description: "操作系统、计算机网络、数据结构等基础知识",
  },
  {
    value: "other",
    label: "其他",
    description: "其他前端相关的问题",
  },
];

export const difficulties: Difficulty[] = [
  {
    value: "easy",
    label: "简单",
    color: "#22c55e", // green-500
  },
  {
    value: "medium",
    label: "中等",
    color: "#f59e0b", // amber-500
  },
  {
    value: "hard",
    label: "困难",
    color: "#ef4444", // red-500
  },
];

// 获取分类信息
export const getCategoryInfo = (
  value: string
): QuestionCategory | undefined => {
  return questionCategories.find((cat) => cat.value === value);
};

// 获取难度信息
export const getDifficultyInfo = (
  value: "easy" | "medium" | "hard"
): Difficulty | undefined => {
  return difficulties.find((diff) => diff.value === value);
};
