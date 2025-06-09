import introduce from './introduce'
import project from './project'
import personal from './personal'
export const getCustomData = (val: string) => {
  switch (val) {
    case '自我介绍':
      return introduce
    case '项目经历':
      return project
    case '个人成长':
      return personal
    default:
      return undefined
  }
}