import { collection, config, fields } from "@keystatic/core";

/**
 * Keystatic 本地编辑后台
 * 用法：pnpm dev  →  打开 http://localhost:4321/keystatic
 * 存储：本地文件（直接写 src/content/posts/*.md，不经过任何服务器）
 * 字段：与 src/content.config.ts 里 posts 集合的 schema 一一对应
 */
export default config({
	storage: { kind: "local" },

	ui: {
		brand: { name: "次元代码终端" },
		navigation: {
			内容: ["posts"],
		},
	},

	collections: {
		posts: collection({
			label: "文章",
			slugField: "title",
			path: "src/content/posts/*",
			format: { contentField: "content" },
			entryLayout: "content",
			columns: ["title", "published", "draft"],

			schema: {
				title: fields.slug({
					name: {
						label: "标题",
						validation: { isRequired: true },
					},
					slug: {
						label: "文件名 / URL（用英文或拼音）",
						description: "决定文章地址：/posts/<这个值>/ ，建好后别改，改了旧链接会 404",
						validation: { isRequired: true },
					},
				}),

				published: fields.date({
					label: "发布日期",
					validation: { isRequired: true },
				}),
				updated: fields.date({ label: "更新日期（可选）" }),

				description: fields.text({
					label: "摘要（可选）",
					description: "列表页和搜索引擎用，一两句话",
					multiline: true,
				}),

				image: fields.image({
					label: "封面图（可选）",
					description: "上传后自动存进 public/images/posts/",
					directory: "public/images/posts",
					publicPath: "/images/posts/",
				}),

				tags: fields.array(fields.text({ label: "标签" }), {
					label: "标签",
					itemLabel: (props) => props.value || "新标签",
				}),

				category: fields.text({
					label: "分类（可选）",
					description: "填了才会归进分类页",
				}),

				pinned: fields.checkbox({ label: "置顶", defaultValue: false }),
				draft: fields.checkbox({
					label: "草稿（正式部署时隐藏）",
					defaultValue: false,
				}),
				comment: fields.checkbox({ label: "开启评论", defaultValue: true }),

				lang: fields.text({ label: "语言（可选，留空自动）" }),

				series: fields.text({ label: "系列名（可选）" }),
				seriesOrder: fields.integer({ label: "系列序号（可选）" }),

				author: fields.text({ label: "作者（可选）" }),
				sourceLink: fields.text({ label: "原文链接（可选）" }),
				licenseName: fields.text({ label: "许可协议名称（可选）" }),
				licenseUrl: fields.text({ label: "许可协议链接（可选）" }),

				password: fields.text({
					label: "文章密码（可选）",
					description: "填了这篇文章就变成密码锁文章",
				}),
				passwordHint: fields.text({ label: "密码提示（可选）" }),

				content: fields.markdoc({
					label: "正文",
					options: {
						image: {
							directory: "public/images/posts",
							publicPath: "/images/posts/",
						},
					},
				}),
			},
		}),
	},
});
