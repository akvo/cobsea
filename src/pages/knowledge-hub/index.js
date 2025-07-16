import classNames from 'classnames';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './index.scss';
import { Check2, DropdownIcon, Search } from '../../components/icons';
import api from '../../utils/api';
import {
  Collapse,
  Dropdown,
  Input,
  Menu,
  Select,
  Space,
  Spin,
  Button,
} from 'antd';
import { debounce } from 'lodash';
import { UIStore } from '../../store';
import { DownOutlined, LoadingOutlined } from '@ant-design/icons';
import DetailModal from 'pages/detail/modal';
import { useHistory, Link } from 'react-router-dom';
import bodyScrollLock from 'utils/scroll-utils';
import ResourceCard from 'components/resource-card';

const lifecycleStageTags = [
  `Production`,
  `Consumption`,
  `Waste Management`,
  `Legacy Plastics`,
  `Full Life Cycle`,
];

export const getCountryIdsFromGeoGroups = (
  selectedGeoCountryGroup,
  geoCountryGroups
) => {
  let countryIds = [];
  selectedGeoCountryGroup.forEach((groupName) => {
    const group = geoCountryGroups.find((g) => g.name === groupName);
    if (group) {
      countryIds = [
        ...countryIds,
        ...group.countries.map((country) => country.id),
      ];
    }
  });
  return countryIds;
};

const KnowledgeHub = ({ setLoginVisible, isAuthenticated }) => {
  const history = useHistory();
  const [urlParams, setUrlParams] = useState({
    topic: '',
    tag: '',
    geo: '',
    q: '',
    country: '',
    orderBy: 'created',
    descending: 'true',
  });

  const [results, setResults] = useState([]);
  const [collapseKeys, setCollapseKeys] = useState(['p1', 'p2', 'p3', 'p4']);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const selectedTypes = urlParams.topic ? urlParams.topic.split(',') : [];

  const tagsAndThemes = urlParams.tag ? urlParams.tag.split(',') : [];
  const selectedThemes = tagsAndThemes.filter((tag) =>
    lifecycleStageTags.some(
      (stageTag) => stageTag.toLowerCase() === tag.toLowerCase()
    )
  );

  const selectedTags = tagsAndThemes.filter(
    (tag) =>
      !lifecycleStageTags.some(
        (stageTag) => stageTag.toLowerCase() === tag.toLowerCase()
      )
  );

  const [searchInput, setSearchInput] = useState(urlParams.q || '');
  const [params, setParams] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { featuredOptions, tags } = UIStore.useState((s) => ({
    countries: s.countries,
    featuredOptions: s.featuredOptions,
    tags: s.tags,
  }));

  const [sorting, setSorting] = useState(
    urlParams.orderBy === 'created'
      ? urlParams.descending === 'true'
        ? 'newest'
        : 'oldest'
      : 'newest'
  );

  const tagOpts = useMemo(() => {
    return tags && Object.keys(tags).length > 0
      ? tags.general
          .map((it) => ({ value: it.tag, label: it.tag }))
          .filter((it) => !lifecycleStageTags.includes(it.value))
          .sort((a, b) => a.label.localeCompare(b.label))
      : [];
  }, [tags]);

  const [displayedOptions, setDisplayedOptions] = useState([]);
  const OPTION_PAGE_SIZE = 100;

  useEffect(() => {
    setDisplayedOptions(tagOpts.slice(0, OPTION_PAGE_SIZE));
  }, [tagOpts]);

  const onPopupScroll = (e) => {
    const { target } = e;
    if (
      target.scrollTop + target.offsetHeight >= target.scrollHeight &&
      displayedOptions.length < tagOpts.length
    ) {
      const nextOptions = tagOpts.slice(
        displayedOptions.length,
        displayedOptions.length + OPTION_PAGE_SIZE
      );
      setDisplayedOptions((prevOptions) => [...prevOptions, ...nextOptions]);
    }
  };

  const handleDropdownVisibilityChange = (open) => {
    if (!open) {
      setDisplayedOptions(tagOpts.slice(0, OPTION_PAGE_SIZE));
    }
  };

  const updateParams = useCallback(
    (updates) => {
      const selectedCountryGroupCountries = getCountryIdsFromGeoGroups(
        updates.geo ? updates.geo.split(',') : [],
        updates.featuredOptions ? updates.featuredOptions : featuredOptions
      );

      const newParams = {
        ...urlParams,
        ...updates,
      };

      if (newParams.geo) {
        newParams.country = selectedCountryGroupCountries.join(',');
      } else if (newParams.country) {
        delete newParams.geo;
      }

      if (newParams.orderBy) {
        delete newParams.orderBy;
      }
      if (newParams.featuredOptions) {
        delete newParams.featuredOptions;
      }

      // Remove empty params
      Object.keys(newParams).forEach(
        (key) =>
          (newParams[key] === undefined || newParams[key] === '') &&
          delete newParams[key]
      );

      setUrlParams(newParams);
      setOffset(0); // Reset offset when filters change

      // Trigger new search
      fetchData(newParams, 0, false);
    },
    [urlParams, featuredOptions]
  );

  // Fetch data function
  const fetchData = async (
    params = urlParams,
    currentOffset = 0,
    isLoadMore = false
  ) => {
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        ...(params.q && { q: params.q }),
        ...(params.tag && { tag: params.tag }),
        ...(params.topic && { topic: params.topic }),
        incBadges: 'true',
        limit: '20',
        transnational: 132,
        offset: currentOffset.toString(),
        orderBy: params.orderBy || 'created',
        descending: params.descending || 'true',
      });

      const response = await api.get(`/resources?${queryParams.toString()}`);
      const newResults = response.data.results;

      if (isLoadMore) {
        setResults((prevResults) => [...prevResults, ...newResults]);
      } else {
        setResults(newResults);
      }

      setHasMore(newResults.length === 20);
      setOffset(currentOffset + newResults.length);
    } catch (error) {
      console.error('Error fetching data:', error);
      setResults([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, []);

  const themes = lifecycleStageTags.map((it) => ({ name: it }));

  const types = [
    { name: `Project`, value: 'project' },
    { name: `Technical Resource`, value: 'technical_resource' },
    { name: `Technology`, value: 'technology' },
    { name: `Action Plan`, value: 'action_plan' },
    { name: `Legislation`, value: 'policy' },
    { name: `Financing Resource`, value: 'financing_resource' },
    { name: `Case Study`, value: 'case_study' },
    { name: `Initiative`, value: 'initiative' },
    { name: `Event`, value: 'event' },
    { name: `Data Portal`, value: 'data_catalog' },
  ];

  const handleThemeToggle = (theme) => {
    const lowerCaseTheme = theme.toLowerCase();
    const newThemes = selectedThemes.includes(lowerCaseTheme)
      ? selectedThemes.filter((t) => t !== lowerCaseTheme)
      : [...selectedThemes, lowerCaseTheme];

    const allTags = [...selectedTags, ...newThemes];
    updateParams({
      tag: allTags.length > 0 ? allTags.join(',') : undefined,
    });
  };

  const handleTypeToggle = (type) => {
    const newTypes = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    updateParams({
      topic: newTypes.length > 0 ? newTypes.join(',') : undefined,
    });
  };

  const handleTagsChange = (value) => {
    const allTags = [...selectedThemes, ...value];
    updateParams({ tag: allTags.length > 0 ? allTags.join(',') : undefined });
  };

  const showModal = ({ e, item }) => {
    const { type, id } = item;
    e.preventDefault();
    if (type && id) {
      const detailUrl = `/${type.replace(/_/g, '-')}/${id}`;
      e.preventDefault();
      setParams({ type: type.replace(/_/g, '-'), id, item });
      window.history.pushState(
        { urlPath: `/${detailUrl}` },
        '',
        `${detailUrl}`
      );
      setModalVisible(true);
      bodyScrollLock.enable();
    }
  };

  const loadMore = async () => {
    if (!loading && hasMore) {
      await fetchData(urlParams, offset, true);
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value) {
      debouncedUpdateSearch(value);
    } else {
      debouncedUpdateSearch.cancel();
      updateParams({ q: '' });
    }
  };

  const debouncedUpdateSearch = useCallback(
    debounce((value) => {
      updateParams({ q: value });
    }, 300),
    [updateParams]
  );

  const sortingOpts = useMemo(
    () => [
      {
        key: 'newest',
        label: `Most Recent First`,
        apiParams: { orderBy: 'created', descending: 'true' },
      },
      {
        key: 'oldest',
        label: `Oldest First`,
        apiParams: { orderBy: 'created', descending: 'false' },
      },
    ],
    []
  );

  const handleSortingChange = useCallback(
    (key) => {
      const selectedSort = sortingOpts.find((opt) => opt.key === key.key);
      if (selectedSort) {
        setSorting(key.key);
        updateParams(selectedSort.apiParams);
      }
    },
    [updateParams, sortingOpts]
  );

  useEffect(() => {
    const onresize = () => {
      if (window.innerWidth <= 768) {
        setCollapseKeys([]);
      } else {
        setCollapseKeys(['p1', 'p2', 'p3', 'p4']);
      }
    };
    onresize();
    window.addEventListener('resize', onresize);
    return () => {
      window.removeEventListener('resize', onresize);
    };
  }, []);

  const handleCollapseChange = (v) => {
    setCollapseKeys(v);
  };

  const hideModal = () => {
    console.log(history);
    setModalVisible(false);
    const previousHref = `${history?.location?.pathname}${history?.location?.search}`;
    window.history.pushState(
      { urlPath: `/${previousHref}` },
      '',
      `${previousHref}`
    );
  };

  return (
    <div className="knowledgeHub">
      <aside className="filter-sidebar">
        <div className="sticky">
          <Input
            className="src"
            allowClear
            placeholder={`Search The Knowledge Library`}
            value={searchInput}
            onChange={handleSearchChange}
          />
          <div className="caps-heading-xs">browse resources by</div>
          <Collapse
            onChange={handleCollapseChange}
            activeKey={collapseKeys}
            expandIcon={({ isActive }) =>
              isActive ? <DropdownIcon /> : <DropdownIcon />
            }
          >
            <Collapse.Panel
              key="p1"
              header={<h4 className="h-xs w-semi">Life Cycle Stage</h4>}
            >
              <div className="filters">
                {themes?.map((theme) => (
                  <FilterToggle
                    key={theme.name}
                    onToggle={() => handleThemeToggle(theme.name)}
                    isSelected={selectedThemes.some(
                      (selectedTheme) =>
                        selectedTheme.toLowerCase() === theme.name.toLowerCase()
                    )}
                  >
                    {theme.name}
                  </FilterToggle>
                ))}
              </div>
            </Collapse.Panel>
            <Collapse.Panel
              key="p2"
              header={<h4 className="h-xs w-semi">Resource Type</h4>}
            >
              <div className="filters">
                {types.map((type) => (
                  <FilterToggle
                    key={type.name}
                    onToggle={() => handleTypeToggle(type.value)}
                    isSelected={selectedTypes.includes(type.value)}
                  >
                    {type.name}
                  </FilterToggle>
                ))}
              </div>
            </Collapse.Panel>
            <Collapse.Panel
              key="p4"
              header={<h4 className="h-xs w-semi">Keywords</h4>}
            >
              <Select
                size="small"
                showSearch
                allowClear
                mode="multiple"
                dropdownStyle={{ width: '200px' }}
                dropdownClassName="hub-tags-dropdown"
                dropdownMatchSelectWidth={false}
                placement="topLeft"
                placeholder={`Keywords`}
                options={displayedOptions}
                optionFilterProp="children"
                filterOption={(input, option) =>
                  option?.label?.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
                showArrow
                virtual={true}
                suffixIcon={<Search />}
                onPopupScroll={onPopupScroll}
                onChange={handleTagsChange}
                value={selectedTags}
                onDropdownVisibleChange={handleDropdownVisibilityChange}
                className="tag-select"
              />
            </Collapse.Panel>
          </Collapse>
        </div>
      </aside>
      <div className="content">
        <div className="sorting">
          <Dropdown
            overlay={
              <Menu
                defaultSelectedKeys={['newest']}
                selectable
                onSelect={handleSortingChange}
                selectedKeys={sorting}
              >
                {sortingOpts.map((it) => (
                  <Menu.Item key={it.key}>{it.label}</Menu.Item>
                ))}
              </Menu>
            }
            trigger={['click']}
          >
            <Space>
              {sortingOpts.find((it) => it.key === sorting)?.label}
              <DownOutlined />
            </Space>
          </Dropdown>
        </div>
        {loading && (
          <div className="loading">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />}
            />
          </div>
        )}
        <div className="results">
          {results?.map((result) => (
            <Link
              to={`/${result.type.replace(/_/g, '-')}/${result.id}`}
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              <ResourceCard item={result} onClick={showModal} />
            </Link>
          ))}
          {results?.length === 0 && !loading && (
            <>
              <div className="no-results">
                <h4 className="caps-heading-s">No results</h4>
              </div>
            </>
          )}
        </div>
        {hasMore && results.length > 0 && (
          <Button size="xs" ghost onClick={loadMore} className="load-more">
            Load More
          </Button>
        )}
      </div>
      <DetailModal
        match={{ params }}
        visible={modalVisible}
        setVisible={() => hideModal()}
        {...{
          setLoginVisible,
          isAuthenticated,
        }}
      />
    </div>
  );
};

export const FilterToggle = ({ children, onToggle, isSelected }) => {
  const handleClick = (e) => {
    e.preventDefault();
    onToggle();
  };

  const checkIconStyle = {
    display: 'inline-block',
    width: isSelected ? '9px' : '0px',
    height: isSelected ? '8px' : '0px',
    marginRight: isSelected ? '5px' : '0px',
    transition: 'width 0.2s ease, height 0.2s ease, margin-right 0.2s ease',
    opacity: isSelected ? 1 : 0,
  };

  const content = (
    <>
      <span style={checkIconStyle}>
        <Check2 />
      </span>
      {children}
    </>
  );

  return (
    <span
      className={classNames('filter', { on: isSelected })}
      onClick={handleClick}
    >
      {content}
    </span>
  );
};

export default KnowledgeHub;
