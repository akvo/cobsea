import React from 'react';
import { Select, Popover, Space } from 'antd';
import { DownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import isEmpty from 'lodash/isEmpty';
import { PullstateCore } from 'stores';
import { multicountryGroups } from './multicountry';
const { Option, OptGroup } = Select;
import styles from './style.module.scss';
import api from 'utils/api';

const cobseaContries = [
	'Cambodia',
	'China',
	'Indonesia',
	'Republic of Korea',
	'Philippines',
	'Thailand',
	'Singapore',
	'Viet Nam',
	'Malaysia',
];

const CountryTransnationalFilter = ({
	query,
	updateQuery,
	country,
	multiCountry,
	multiCountryCountries,
	multiCountryLabelCustomIcon,
	countrySelectMode,
	multiCountrySelectMode,
	setMultiCountryCountries,
	isExpert,
	disable,
	setDisable,
	fetch,
}) => {
	const { UIStore } = PullstateCore.useStores();
	const { countries, transnationalOptions, landing } = UIStore.useState(
		(s) => ({
			countries: s.countries,
			transnationalOptions: s.transnationalOptions,
			landing: s.landing,
		}),
	);

	const isLoaded = () => !isEmpty(countries) && !isEmpty(transnationalOptions);

	const countryOpts = isLoaded()
		? countries
				.filter((country) => cobseaContries.includes(country.name))
				.map((it) => ({ value: it.id, label: it.name }))
				.sort((a, b) => a.label.localeCompare(b.label))
		: [];

	const handleChangeCountry = (val) => {
		if (isExpert) {
			updateQuery('country', val);
			return;
		}
		if (setDisable) {
			setDisable({
				...disable,
				...(val.length > 0 ? { multiCountry: true } : { multiCountry: false }),
			});
		}
		updateQuery('country', val, false);
	};

	return (
		<>
			<Space align='middle'>
				<div className='filter-title multiple-filter-title'>Location</div>
			</Space>
			<Select
				showSearch
				allowClear
				popupClassName='multiselection-dropdown'
				mode={countrySelectMode || ''}
				placeholder='Countries'
				options={countryOpts}
				optionFilterProp='children'
				filterOption={(input, option) =>
					option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
				}
				value={country}
				onChange={handleChangeCountry}
				// onDeselect={handleDeselectCountry}
				virtual={false}
			/>
		</>
	);
};

const MultiCountryInfo = ({ data, multiCountryCountries }) => {
	const renderContent = () => {
		return (
			<div className='popover-content-wrapper'>
				{multiCountryCountries &&
					multiCountryCountries.map(({ id, name }) => {
						const curr = data?.map?.find((i) => i?.countryId === id);

						return (
							<div
								key={`popover-${name}-${id}`}
								className='popover-content-item'
							>
								{name}
							</div>
						);
					})}
			</div>
		);
	};

	if (!multiCountryCountries || isEmpty(multiCountryCountries)) {
		return '';
	}
	return (
		<Popover
			overlayClassName='country-info-popover'
			className='popover-multi-country'
			title={''}
			content={renderContent}
			placement='right'
			arrowPointAtCenter
		>
			<InfoCircleOutlined />
		</Popover>
	);
};

export default CountryTransnationalFilter;
