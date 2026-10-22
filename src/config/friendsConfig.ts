import type { FriendLink, FriendsPageConfig } from "../types/friendsConfig";

// 可以在src/content/spec/friends.md中编写友链页面下方的自定义内容

// 友链页面配置
export const friendsPageConfig: FriendsPageConfig = {
	// 页面标题，如果留空则使用 i18n 中的翻译
	title: "",

	// 页面描述文本，如果留空则使用 i18n 中的翻译
	description: "",

	// 是否显示底部自定义内容（friends.mdx 中的内容）
	showCustomContent: true,

	// 是否显示评论区，需要先在commentConfig.ts启用评论系统
	showComment: true,

	// 是否开启随机排序配置，如果开启，就会忽略权重，构建时进行一次随机排序
	randomizeSort: false,
};

// 友链配置
// 交到朋友后照着下面的格式往里加就行，enabled 为 false 时不显示：
// {
// 	title: "对方站名",
// 	imgurl: "对方头像直链",
// 	desc: "一句话描述",
// 	siteurl: "https://对方域名",
// 	tags: ["Blog"],
// 	weight: 10, // 权重，数字越大排序越靠前
// 	enabled: true, // 是否启用
// },
export const friendsConfig: FriendLink[] = [
	{
		title: "Firefly",
		imgurl: "https://docs-firefly.cuteleaf.cn/logo.png",
		desc: "本站使用的 Astro 博客主题",
		siteurl: "https://github.com/CuteLeaf/Firefly",
		tags: ["主题"],
		weight: 1,
		enabled: true,
	},
];

// 获取启用的友链并进行排序
export const getEnabledFriends = (): FriendLink[] => {
	const friends = friendsConfig.filter((friend) => friend.enabled);

	if (friendsPageConfig.randomizeSort) {
		return friends.sort(() => Math.random() - 0.5);
	}

	return friends.sort((a, b) => b.weight - a.weight);
};
