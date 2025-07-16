import React, { useEffect, useState } from 'react';
import './style.scss';
import { Empty, Select, Spin, notification } from 'antd';
import axios from 'axios';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
import { DropdownIcon } from 'components/icons';
import { getStrapiUrl } from 'utils/misc';

function CaseStudy({ initialItems = [] }) {
  const [items, setItems] = useState(initialItems);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All categories');

  const strapiURL = getStrapiUrl();

  const handleCategoryChange = (value) => {
    setSelectedCategory(value || 'All categories');
  };

  useEffect(() => {
    const fetchCaseStudies = async () => {
      if (initialItems.length === 0) {
        setLoading(true);
        try {
          const response = await axios.get(
            `${strapiURL}/api/cobsea-case-studies?populate=image&populate=cobsea_case_study_tag&populate=pdf`
          );
          const simplifiedItems = response.data.data.map((item) => {
            const {
              title,
              url,
              cobsea_case_study_tag,
              description,
              image,
              pdf,
            } = item.attributes;
            return {
              title,
              url,
              description,
              pdf: pdf?.data?.attributes?.url || '',
              category: cobsea_case_study_tag?.data?.attributes?.name,
              ...(image?.data && { image: image.data.attributes.url }),
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

    fetchCaseStudies();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `${strapiURL}/api/cobsea-case-study-tags`
        );
        const categoryList = response.data.data.map((item) => {
          const { name } = item.attributes;
          return {
            label: name,
            value: name,
          };
        });

        setCategories([
          { label: 'All categories', value: 'All categories' },
          ...categoryList.map((cat) => ({
            label: cat.label,
            value: cat.label,
          })),
        ]);
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

    fetchCategories();
  }, []);

  const filteredItems = items.filter((item) => {
    const categoryMatch =
      selectedCategory === 'All categories' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    return categoryMatch;
  });

  return (
    <div className="learning-centre container">
      <h1>Case Studies</h1>
      <div className="header">
        <div className="category-dropdown">
          <Select
            showSearch
            showArrow
            value={selectedCategory}
            style={{ width: 300 }}
            placeholder="Select category"
            onChange={handleCategoryChange}
            suffixIcon={selectedCategory ? <DropdownIcon /> : null}
            options={categories}
          />
        </div>
      </div>
      <CaseStudyCard data={filteredItems} loading={loading} />
    </div>
  );
}

const CaseStudyCard = ({ data, loading }) => {
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
              href={item.pdf || item.url}
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
              </div>
            </a>
          ))}
        </Masonry>
      </ResponsiveMasonry>
    </div>
  );
};

export default CaseStudy;
