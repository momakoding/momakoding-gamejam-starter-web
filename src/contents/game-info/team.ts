/**
 * 团队与成员信息 — 只放数据，类型定义见 types.ts
 * 如需为某位成员添加详细介绍，在 team-intro/ 目录下创建同名 .md 文件。
 */

import type { TeamInfo } from '.'

export const TEAM_INFO: TeamInfo = {
  teamName: '[团队名称]',
  description: '[这里是团队介绍和项目信息的占位文本。]',
  members: [
    {
      name: '[成员 A]',
      role: '策划 / 程序',
      avatar: '👤',
    },
    {
      name: '[成员 B]',
      role: '美术 / 音效',
      avatar: '👤',
    },
  ],
}
