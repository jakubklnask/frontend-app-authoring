import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { SmartFooterSlot } from '@edx/frontend-component-footer';
import Header from './header';
import { fetchCourseDetail } from './data/thunks';
import { useModel } from './generic/model-store';
import NotFoundAlert from './generic/NotFoundAlert';
import PermissionDeniedAlert from './generic/PermissionDeniedAlert';
import { fetchOnlyStudioHomeData } from './studio-home/data/thunks';
import { getCourseAppsApiStatus } from './pages-and-resources/data/selectors';
import { RequestStatus } from './data/constants';
import Loading from './generic/Loading';

const CourseAuthoringPage = ({ courseId, children }) => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  
  useEffect(() => {
    dispatch(fetchCourseDetail(courseId));
  }, [courseId]);
  
  useEffect(() => {
    dispatch(fetchOnlyStudioHomeData());
  }, []);
  
  const courseDetail = useModel('courseDetails', courseId);
  const courseDetailStatus = useSelector(state => state.courseDetail.status);
  
  // Get course outline loading status if on outline page
  const outlineLoadingStatus = useSelector(state => state.courseOutline?.loadingStatus);
  
  const isEditor = pathname.includes('/editor');
  const isCourseOutlinePage = pathname === `/course/${courseId}` || pathname === `/course/${courseId}/`;
  
  // Check course detail loading
  let isLoading = courseDetailStatus === RequestStatus.IN_PROGRESS;
  
  // If on course outline page, also check outline loading
  if (isCourseOutlinePage && outlineLoadingStatus) {
    isLoading = isLoading || 
      outlineLoadingStatus.outlineIndexLoadingStatus === RequestStatus.IN_PROGRESS;
  }
  
  if (courseDetailStatus === RequestStatus.NOT_FOUND && !isEditor) {
    return <NotFoundAlert />;
  }
  
  const courseAppsApiStatus = useSelector(getCourseAppsApiStatus);
  if (courseAppsApiStatus === RequestStatus.DENIED) {
    return <PermissionDeniedAlert />;
  }
  
  return (
    <div>
      {isLoading ? (
        !isEditor && <Loading />
      ) : (
        !isEditor && (
          <Header
            number={courseDetail?.number}
            org={courseDetail?.org}
            title={courseDetail?.name || courseId}
            contextId={courseId}
          />
        )
      )}
      {children}
      {!isEditor && <SmartFooterSlot loading={isLoading} />}
    </div>
  );
};

CourseAuthoringPage.propTypes = {
  children: PropTypes.node,
  courseId: PropTypes.string.isRequired,
};

CourseAuthoringPage.defaultProps = {
  children: null,
};

export default CourseAuthoringPage;