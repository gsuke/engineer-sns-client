import useSWRInfinite, { SWRInfiniteConfiguration, SWRInfiniteKeyLoader } from 'swr/infinite';
import fetcher from '../lib/fetcher';
import type Text from '../lib/models/Text';
import { textCountPerPage } from '../lib/const';

export default function useTexts() {
  const getKey: SWRInfiniteKeyLoader = (pageIndex, previousPageData: Text[] | null) => {
    // 最後に到達した場合
    if (previousPageData && !previousPageData.length) return null;

    // SWRキーを返却
    const skipCount = pageIndex * textCountPerPage;
    return `/text/all?$orderby=_created_at desc&$limit=${textCountPerPage}&$skip=${skipCount}`;
  };

  // 各ページは全てイミュータブルとし、新規投稿への対応は別途行う
  const option: SWRInfiniteConfiguration = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateFirstPage: false,
  };

  const { data, error, isValidating, size, setSize } = useSWRInfinite<Text, Error>(
    getKey,
    fetcher,
    option,
  );

  const isLoadingInitialData = !data && !error;
  const isLoadingMore =
    isLoadingInitialData || (size > 0 && data && typeof data[size - 1] === 'undefined');

  // ページ毎に区切られたtextsを平坦化する
  const texts = data?.flat() || [];

  return {
    texts,
    error,
    isValidating,
    size,
    setSize,
    isLoadingInitialData,
    isLoadingMore,
  };
}
