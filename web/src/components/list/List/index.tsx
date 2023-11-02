//List of elements component that can be used in home, profile and other pages/layouts where we need to ddisplay buttons/networks/other elements
//a foreach => buttons
import React,{ useState } from 'react';
import { IoChevronForwardOutline } from 'react-icons/io5';
import { IoChevronBackOutline } from 'react-icons/io5';
import ContentList from 'components/list/ContentList';
import { useButtonTypes } from 'shared/buttonTypes';
import Btn, { BtnType, ContentAlignment, IconType } from 'elements/Btn';
import { Dropdown } from 'elements/Dropdown/Dropdown';
import t from 'i18n';
import { AdvancedFiltersSortDropDown, ButtonsOrderBy } from 'components/search/AdvancedFilters';
import { GlobalState, store } from 'pages';
import { useStore } from 'store/Store';
import { useForm } from 'react-hook-form';
import { UpdateFilters } from 'state/Explore';



function List({
  onLeftColumnToggle,
  buttons,
  showLeftColumn,
  showFiltersForm,
  showMap,
  toggleShowMap,
}) {

  const filters = useStore(
    store,
    (state: GlobalState) => state.explore.map.filters,
    false,
  );

  const showOrderBy = !showMap || showLeftColumn ?  true : false;


  const handleChangeShowMap = (event) => {
    toggleShowMap(event.target.value);
  };

  const updatesOrderByFilters = (value)=> { 

      const newFilters = { ...filters, orderBy: value }
      store.emit(new UpdateFilters(newFilters));

  }

  const handleChange = (event) => {
    onLeftColumnToggle(event.target.value);
  };

  
  const [buttonTypes, setButtonTypes] = useState([]);
  useButtonTypes(setButtonTypes);
  let [numberButtons, setNumberButtons] = React.useState(5);
  const handleScrollWidth = (e) => {
    
    const edge = e.target.scrollWidth - e.target.scrollLeft === e.target.clientWidth;
    const edgeHeight = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (edge || edgeHeight) { 
      setNumberButtons((prevValue) => { 
        const newValue = prevValue + 2 
        if (newValue < buttons.length)
          return newValue
        return prevValue
      })
    }
  }

  const handleScrollHeight = (e) => {
    const edgeHeight = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (edgeHeight) { 
      setNumberButtons((prevValue) => { 
        const newValue = prevValue + 2 
        if (newValue < buttons.length)
          return newValue
        return prevValue
      })
    }
  }


  return (
    <>
      {!showFiltersForm && (
        <>

            <div className='list__order'>

                { showOrderBy &&
                  <>
                    <div >{t('buttonFilters.orderBy')}</div>

                    <AdvancedFiltersSortDropDown
                    className={'dropdown__dropdown-trigger--list'}
                    orderBy={filters.orderBy}
                    setOrderBy={(value) => updatesOrderByFilters(value)}
                    buttonTypes={buttonTypes}
                    selectedButtonTypes={filters.helpButtonTypes}
                    />
                  </>
                }


                {/* {showMap && 
                
                  <div className="drag-tab__icon"
                   onClick={handleChange}
                  >
                        {showLeftColumn ? (
                          <IoChevronBackOutline />
                        ) : (
                          <IoChevronForwardOutline />
                        )}
                  </div>
                
                
                } */}

                
              {/* <span className="list__order--item">Show List</span> */}

            </div>

            <div
              className={
                'list__container ' + (showMap ? '' : ' list__container--full-list')
              }
              onScroll={handleScrollHeight}
            >
              <div
                  onClick={handleChange}
                  className={
                    'drag-tab ' + (showLeftColumn ? '' : 'drag-tab--open') 
                  }
                >

                  <span className="drag-tab__line"></span>

                  <div className="drag-tab__icon">
                    {showLeftColumn ? (
                      <IoChevronBackOutline />
                    ) : (
                      <IoChevronForwardOutline />
                    )}
                  </div>

              </div>

              <div 
                className={
                  'list__content ' + (showMap ? 'list__content--row' : 'list__content--full-screen')
                }
                onScroll={handleScrollWidth}
              >
                {buttonTypes?.length > 0 && 
                <ContentList buttons={buttons.slice(0, numberButtons)} buttonTypes={buttonTypes}/>
                }
              </div>

            </div>


        </>
      )}
    </>
  );
}

export default List;