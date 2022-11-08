import humps from 'humps';
import { useRouter } from 'next/router';

export const resourceTypes = [
	{
		key: 'technical-resource',
		label: 'Technical Resources',
		title: 'technical_resource',
	},
	{ key: 'event', label: 'Events', title: 'event' },
	{ key: 'technology', label: 'Technologies', title: 'technology' },
	{
		key: 'capacity-building',
		label: 'Capacity Development',
		title: 'capacity building',
	},
	{ key: 'initiative', label: 'Initiatives', title: 'initiative' },
	{ key: 'action-plan', label: 'Action Plans', title: 'action_plan' },
	{ key: 'policy', label: 'Policies', title: 'policy' },
	{
		key: 'financing-resource',
		label: 'Financing Resources',
		title: 'financing_resource',
	},
	{
		key: 'case-studies',
		label: 'Case Studies',
		title: 'case_studies',
	},
];

export const resourceSubTypes = new Set([
	'financing_resource',
	'technical_resource',
	'action_plan',
]);

export const resourceTypeToTopicType = (type) =>
	resourceSubTypes.has(type) ? 'resource' : type;

export const randomColor = (string) => {
	const colors = [
		'#FFB800',
		'#98B527',
		'#38A259',
		'#008776',
		'#006776',
		'#2F4858',
		'#FFC1B4',
		'#FE8A7F',
		'#C1554E',
	];

	let hash = 0;
	if (string?.length === 0) return hash;
	for (let i = 0; i < string?.length; i++) {
		hash = string?.charCodeAt(i) + ((hash << 5) - hash);
		hash = hash & hash;
	}
	hash = ((hash % colors.length) + colors.length) % colors.length;
	return colors[hash];
};

export const languageOptions = [
	{
		label: 'Arabic',
		key: '0',
		value: 'ar',
		dbValue: 'ar',
	},
	{
		label: 'Chinese',
		key: '1',
		value: 'cn',
		dbValue: 'zh',
	},
	{
		label: 'French',
		key: '3',
		value: 'fr',
		dbValue: 'fr',
	},
	{
		label: 'Russian',
		key: '4',
		value: 'ru',
		dbValue: 'ru',
	},
	{
		label: 'Spanish',
		key: '5',
		value: 'es',
		dbValue: 'es',
	},
	{
		label: 'English',
		key: '6',
		value: 'en',
		dbValue: 'en',
	},
];

export const getTypeByResource = (type) => {
	let t = '';
	let name = '';
	let translations = '';
	switch (type) {
		case 'action_plan':
			t = 'action';
			name = 'Action Plan';
			translations = 'resource';
			break;
		case 'event':
			t = 'event_flexible';
			name = 'Event';
			translations = 'event';
			break;
		case 'initiative':
			t = 'initiative';
			name = 'Initiative';
			translations = 'initiative';
			break;
		case 'policy':
			t = 'policy';
			name = 'Policy';
			translations = 'policy';
			break;
		case 'financing_resource':
			t = 'financing';
			name = 'Financing Resource';
			translations = 'resource';
			break;
		case 'technical_resource':
			t = 'technical';
			name = 'Technical Resource';
			translations = 'resource';
			break;
		case 'technology':
			t = 'technology';
			name = 'Technology';
			translations = 'technology';
			break;
	}
	return { type: t, name: name, translations: translations };
};

export const topicNames = (topic) => {
	const names = {
		initiative: 'Initiative',
		actionPlan: 'Action Plan',
		policy: 'Policy',
		technicalResource: 'Technical Resource',
		financingResource: 'Financing Resource',
		event: 'Event',
		technology: 'Technology',
		organisation: 'Entity',
		stakeholder: 'Individual',
		capacityBuilding: 'Capacity Building',
	};
	return names[humps.camelize(topic)];
};

export const useQuery = () => {
	const router = useRouter();
	const srcParams = new URLSearchParams(router.query);
	const ret = {};
	for (var key of srcParams.keys()) {
		ret[key] = srcParams
			.get(key)
			.split(',')
			.filter((it) => it !== '');
	}
	return ret;
};

export const titleCase = (str, delimiter = ' ') => {
	str = str.toLowerCase().split(delimiter);
	for (var i = 0; i < str.length; i++) {
		str[i] = str[i].charAt(0).toUpperCase() + str[i].slice(1);
	}
	return str.join(' ');
};


export const tTypes = [
  "project",
  "actionPlan",
  "policy",
  "technicalResource",
  "financingResource",
  "event",
  "technology",
  "organisation",
  "stakeholder",
];