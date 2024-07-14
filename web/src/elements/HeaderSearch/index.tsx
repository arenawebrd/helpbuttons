import { IoClose, IoSearch } from 'react-icons/io5';
import React, { useRef, useState } from 'react';
import { useStore } from 'store/Store';
import { GlobalState, store } from 'pages';
import { LoadabledComponent } from 'components/loading';
import t from 'i18n';
import { useButtonTypes } from 'shared/buttonTypes';
import { customFieldsFiltersText } from 'components/button/ButtonType/CustomFields/AdvancedFiltersCustomFields';
import { defaultFilters } from 'components/search/AdvancedFilters/filters.type';
import { ResetFilters, ToggleAdvancedFilters } from 'state/Explore';
import { readableDistance } from 'shared/sys.helper';

///search button in explore and home
export function HeaderSearch({ results, toggleAdvancedFilters}) {
  const exploreMapState = useStore(
    store,
    (state: GlobalState) => state.explore.map,
    false,
  );

  const clearButton = useRef(null)

  const filtering= JSON.stringify(defaultFilters) != JSON.stringify(exploreMapState.filters);
  return (
    <div className={filtering ?"header-search__tool--filtered" :"header-search__tool"} >
      <div className="header-search__form" onClick={(e) => { 
        if(clearButton.current?.contains(e.target))
        {
          store.emit(new ResetFilters());
          store.emit(new ToggleAdvancedFilters(false))
        } else{ 
          toggleAdvancedFilters()
        }
        }}>
          <div className="header-search__column">
            <SearchText
              count={results.count}
              where={exploreMapState.filters.where}
              filtering={filtering}
            />
            
            <SearchInfo
              what={exploreMapState.filters.query}
              filters={exploreMapState.filters}
            />
            <div className="header-search__icons">
              {!filtering &&
                <div className="header-search__icon">
                  <IoSearch />
                </div>
              }
              {filtering && 
                <div ref={clearButton} className="header-search__icon--close">
                  <IoClose />
                </div>
              }
            </div>
 
          </div>
        {/* </LoadabledComponent> */}
      </div>
    </div>
  );
}

function SearchText({ count, where , filtering=false}) {
  const selectedNetwork = useStore(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
    false,
  );

  const hexagonClicked = useStore(
    store,
    (state: GlobalState) => state.explore.settings.hexagonClicked,
    false,
  );

  const address = (where) => {


    if(hexagonClicked)
    {
      return t('buttonFilters.selectedArea');
    }else if (where.address && where.radius) {
      return `${t('common.in')} ${where.address} · ${readableDistance(where.radius)}`;
    }else if (filtering) {
      return `${t('buttonFilters.filteredSearch')}`;
    }else if(selectedNetwork?.buttonCount != count){
      return `${t('buttonFilters.focusedArea')}`;
    }else if (selectedNetwork) {
      return `${t('common.in')} ${selectedNetwork.name}`;
    } else {
      return ``;
    }
  };

  const countString = count > 999 ? '> 1000 ': count 
  return (
    <div className="header-search__label">
      {t('buttonFilters.searchBarTop', [address(where),countString])}
    </div>
  );
}

function SearchInfo({ filters, what }) {
  const selectedNetwork = useStore(
    store,
    (state: GlobalState) => state.networks.selectedNetwork,
    false,
  );

  if(!selectedNetwork)
    return ''
    
  const helpButtonTypes = selectedNetwork.buttonTemplates;
  const types = (buttonTypes) => {
    if (buttonTypes.length < 1) {
      return t('buttonFilters.allButtonTypes');
    }

    const buttonTypesCaptions = helpButtonTypes.filter(
      (type) =>
        buttonTypes.find((buttonType) => type.name == buttonType),
    ).map((type) => type.caption)

    return buttonTypesCaptions.toString();
  };
  
  const whatText = (what) => {
    if (what == '') {
      return '';
    }

    return what + ' · ';
  };
  
  return (
    <div className="header-search__info">
      {whatText(what)} {types(filters.helpButtonTypes)} {customFieldsFiltersText(filters, selectedNetwork.currency)}
    </div>
  );
}
