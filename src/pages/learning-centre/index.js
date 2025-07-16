import React, { useEffect, useState } from 'react';
import './style.scss';
import { Empty, Select, Spin, notification } from 'antd';
import axios from 'axios';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { Search } from 'components/icons';
import { CloseOutlined } from '@ant-design/icons';
import { getStrapiUrl } from 'utils/misc';

function CapacityBuilding({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    'All',
    'Online Course',
    'Masterclass',
    'Webinar',
    'Other',
  ];

  const strapiURL = getStrapiUrl();

  const handleTagChange = (value) => {
    setSelectedTags(value);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category.toLowerCase());
  };

  useEffect(() => {
    const fetchLearningCentres = async () => {
      if (initialItems.length === 0) {
        setLoading(true);
        try {
          const response = await axios.get(
            `${strapiURL}/api/learning-centres?populate=learning_centre_tags,image`
          );
          const simplifiedItems = response.data.data.map((item) => {
            const {
              title,
              url,
              Category,
              description,
              image,
              learning_centre_tags,
            } = item.attributes;
            return {
              title,
              url,
              description,
              category: Category,
              ...(image?.data && { image: image.data.attributes.url }),
              learning_centre_tags: learning_centre_tags.data.map(
                (tag) => tag.attributes.name
              ),
            };
          });
          setItems(simplifiedItems);
        } catch (error) {
          if (error) {
            notification.error({
              message: error.response?.data
                ? error.response.data.errorDetails
                : 'An error occurred',
            });
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLearningCentres();
  }, []);

  useEffect(() => {
    const fetchLearningCentresTags = async () => {
      try {
        const response = await axios.get(
          `${strapiURL}/api/learning-centre-tags`
        );
        const simplifiedItems = response.data.data.map((item) => {
          const { name } = item.attributes;
          return {
            name,
          };
        });
        setTags(simplifiedItems);
      } catch (error) {
        if (error) {
          notification.error({
            message: error.response?.data
              ? error.response.data.errorDetails
              : 'An error occurred',
          });
        }
      }
    };

    fetchLearningCentresTags();
  }, []);

  const filteredItems = items.filter((item) => {
    const tagMatch =
      selectedTags.length === 0 ||
      selectedTags.every((tag) => item.learning_centre_tags.includes(tag));
    const categoryMatch =
      selectedCategory === 'all' ||
      item.category.toLowerCase() === selectedCategory;
    return tagMatch && categoryMatch;
  });

  return (
    <div className="learning-centre container">
      <h1>Learning Centre</h1>
      <div className="header">
        <div className="categories">
          <ul>
            {categories.map((category) => (
              <li
                key={category}
                className={`${
                  selectedCategory.toLowerCase() === category.toLowerCase()
                    ? 'selected'
                    : ''
                }`}
                onClick={() => handleCategoryChange(category)}
              >
                {category}
              </li>
            ))}
          </ul>
        </div>
        <div className="filter">
          <Select
            allowClear
            showSearch
            showArrow
            mode="tags"
            placeholder="Filter by tag"
            options={tags.map((item) => ({
              value: item.name,
              label: item.name,
            }))}
            suffixIcon={selectedTags.length === 0 ? <Search /> : null}
            clearIcon={<CloseOutlined />}
            onChange={handleTagChange}
          />
        </div>
      </div>
      <LearningCentreCard data={filteredItems} loading={loading} />
    </div>
  );
}

const LearningCentreCard = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="flex-container">
        <Spin size="large" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex-container">
        <Empty description="No Data" />
      </div>
    );
  }

  return (
    <div className="masonry-grid">
      <ResponsiveMasonry
        columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
        gutterBreakPoints={{ 0: '30px' }}
      >
        <Masonry gutter="30px">
          {data.map((item) => (
            <a
              href={item.url}
              className="learning-centre-card"
              key={item.title}
              target="_blank"
              rel="noopener noreferrer"
            >
              {item.image && <img src={item.image} alt={item.title} />}
              <div className="content">
                <p className="category">{item.category}</p>
                <h2>{item.title}</h2>
                <p className="description">{item.description}</p>
                <div className="tags">
                  {item.learning_centre_tags.map((tag, index) => (
                    <span key={`${tag}-${index}`}>{tag}</span>
                  ))}
                </div>
              </div>
            </a>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default CapacityBuilding;
