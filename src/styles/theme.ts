import type { ThemeConfig } from 'antd'

// HBase Hub 品牌主题：与各演示仓保持一致的绿色主色。
export const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#0a7c5a',
    colorBgLayout: '#f5f7fa',
    borderRadius: 8,
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif",
  },
  components: {
    Layout: { headerBg: '#ffffff', headerHeight: 64, bodyBg: '#f5f7fa' },
    Card: { borderRadiusLG: 12 },
  },
}

// Hero 区深绿渐变（hbase-hub 组织品牌色）
export const HERO_GRADIENT =
  'linear-gradient(135deg, #064e3b 0%, #0a7c5a 55%, #0f5c44 100%)'
