import { connectToDatabase } from '@/lib/mongodb'
import { PermissionConfig, DEFAULT_PERMISSION, PageVisibility } from '@/types/permission'

const COLLECTION_NAME = 'permissions'

// 获取权限配置（如果不存在则创建默认配置）
export async function getPermissionConfig(): Promise<PermissionConfig> {
  const { db } = await connectToDatabase()
  const collection = db.collection<PermissionConfig>(COLLECTION_NAME)

  let config = await collection.findOne({})

  if (!config) {
    // 首次访问，创建默认配置
    const defaultDoc: Omit<PermissionConfig, '_id'> = {
      ...DEFAULT_PERMISSION,
      updatedAt: new Date().toISOString(),
    }
    await collection.insertOne(defaultDoc)
    config = await collection.findOne({})
  }

  return config!
}

// 更新权限配置
export async function updatePermissionConfig(
  update: Partial<Pick<PermissionConfig, 'pages' | 'showcaseItems'>>
): Promise<PermissionConfig> {
  const { db } = await connectToDatabase()
  const collection = db.collection<PermissionConfig>(COLLECTION_NAME)

  const updateFields: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  }

  if (update.pages) {
    updateFields.pages = update.pages
  }
  if (update.showcaseItems) {
    updateFields.showcaseItems = update.showcaseItems
  }

  await collection.updateOne(
    {},
    { $set: updateFields },
    { upsert: true }
  )

  const updated = await collection.findOne({})
  return updated!
}