import { useState, useEffect } from 'react';
import { Spin, Segmented, Button } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import Header from '../../components/Header';
import SplitCard from '../../components/SplitCard';
import { getSplits } from './service';
import { Split } from '../../types';
import { useSocket } from '../../hooks/useSocket';
import './styles.less';

const Splits = () => {
  const [splits, setSplits] = useState<Split[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchSplits = async (pageNum: number, status: string, append = false) => {
    try {
      const qStatus = status === 'all' ? '' : `&status=${status}`;
      const res = await getSplits(pageNum, 10, qStatus);
      
      if (append) {
        setSplits(prev => [...prev, ...res.splits]);
      } else {
        setSplits(res.splits);
      }
      
      setHasMore(pageNum < res.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchSplits(1, statusFilter, false);
  }, [statusFilter]);

  const loadMore = () => {
    setLoadingMore(true);
    const nextPage = page + 1;
    setPage(nextPage);
    fetchSplits(nextPage, statusFilter, true);
  };

  // Real-time updates: refresh list on changes
  const handleSocketUpdate = () => {
    fetchSplits(1, statusFilter, false);
    setPage(1);
  };

  useSocket('split_created', handleSocketUpdate);
  useSocket('split_updated', handleSocketUpdate);
  useSocket('settlement_updated', handleSocketUpdate);
  useSocket('split_deleted', handleSocketUpdate);

  return (
    <div className="page-container splits-page">
      <Header title="All Splits" />

      <div className="filters-container glass-card">
        <Segmented 
          options={[
            { label: 'All', value: 'all' },
            { label: 'Active', value: 'active' },
            { label: 'Settled', value: 'settled' }
          ]}
          value={statusFilter}
          onChange={(val) => setStatusFilter(val as string)}
          block
        />
      </div>

      <div className="splits-list">
        {loading ? (
          <div className="loading-center"><Spin indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />} /></div>
        ) : splits.length > 0 ? (
          <>
            {splits.map((split, i) => (
              <SplitCard key={split._id} split={split} index={i} />
            ))}
            {hasMore && (
              <Button 
                type="dashed" 
                block 
                onClick={loadMore} 
                loading={loadingMore}
                className="load-more-btn"
              >
                Load More
              </Button>
            )}
          </>
        ) : (
          <div className="empty-state glass-card">
            No splits found.
          </div>
        )}
      </div>
    </div>
  );
};

export default Splits;
