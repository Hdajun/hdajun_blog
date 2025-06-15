import { Metadata } from 'next';
import QuestionList from './_components/QuestionList';

export const metadata: Metadata = {
  title: '刷题列表 | Practice Questions',
  description: '在这里你可以浏览所有的编程题目，开始你的刷题之旅',
};

export default function PracticePage() {
  return (
    <div className="container mx-auto px-4">
      {/* <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">刷题列表</h1>
        <p className="text-gray-600">选择一道题目开始练习吧</p>
      </div> */}
      <QuestionList />
    </div>
  );
}