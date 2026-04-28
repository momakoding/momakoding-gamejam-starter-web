/**
 * 团队与成员信息配置
 * 修改这里来填写你的团队名称、成员列表。
 * 如需为某位成员添加详细介绍，在 team-intro/ 目录下创建同名 .md 文件。
 */

export interface TeamMember {
  /** 成员姓名 */
  name: string
  /** 职责角色，如"策划 / 程序" */
  role: string
  /** 头像 emoji 或图片 URL（可选） */
  avatar?: string
  /** 是否有详细介绍页（对应 team-intro/<id>.md） */
  introId?: string
}

export interface TeamInfo {
  /** 团队名称 */
  teamName: string
  /** 团队简介（纯文本，较短） */
  description: string
  /** 成员列表 */
  members: TeamMember[]
}

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
