//Main card of the Button that is used inside ButtonFile component and in ButtonNewPublish for the preview. It has all the Data that a button has andd displays it according to the main buttonTemplate and network that buttton selected.
import {
  IoChevronForwardOutline,
  IoChevronBackOutline,
  IoHeartOutline,
  IoAddCircleOutline,
  IoEllipsisHorizontalSharp,
  IoHeartSharp,
  IoMailOutline,
  IoChatbubbleEllipsesSharp,
  IoCallOutline,
  IoHeart,
} from 'react-icons/io5';
import t from 'i18n';

import ImageWrapper, { ImageType } from 'elements/ImageWrapper';

import router from 'next/router';
import { useEffect, useState } from 'react';
import {
  getShareLink,
  makeImageUrl,
  readableDistance,
} from 'shared/sys.helper';
import { buttonColorStyle } from 'shared/buttonTypes';
import { SetupDtoOut } from 'shared/entities/setup.entity';
import { useRef } from 'store/Store';
import { GlobalState, store } from 'pages';
import Link from 'next/link';
import {
  GetPhone,
  UpdateFiltersToFilterTag,
  updateCurrentButton,
} from 'state/Explore';
import { isAdmin } from 'state/Users';
import { formatMessage } from 'elements/Message';
import MarkerSelectorMap from 'components/map/Map/MarkerSelectorMap';
import { CardButtonCustomFields } from '../ButtonType/CustomFields/CardButtonCustomFields';
import {
  CardSubmenu,
  CardSubmenuOption,
} from 'components/card/CardSubmenu';
import { FollowButton, UnfollowButton } from 'state/Follow';
import { alertService } from 'services/Alert';
import Btn, {
  BtnType,
  ContentAlignment,
  IconType,
} from 'elements/Btn';

const filterTag = (tag) => {
  store.emit(new UpdateFiltersToFilterTag(tag));
};

export default function CardButton({ button, buttonTypes }) {
  const buttonType = buttonTypes.find(
    (buttonType) => buttonType.name == button.type,
  );

  return (
    <>
      {button && (
        <>
          <div
            className="card-button card-button__file"
            style={buttonColorStyle(buttonType.cssColor)}
          >
            <CardButtonHeadBig
              button={button}
              buttonTypes={buttonTypes}
            />
          </div>
          <CardButtonImages button={button} />
          <CardButtonOptions />
        </>
      )}
    </>
  );
}

// card button list on explore
export function CardButtonHeadMedium({ button, buttonType }) {
  return (
    <div className="card-button__content">
      <div className="card-button__header">
        <div className="card-button__avatar">
          <div className="avatar-small">
            <ImageWrapper
              imageType={ImageType.avatar}
              src={button.owner.avatar}
              alt={button.owner.username}
            />
          </div>
        </div>

        <div className="card-button__info">
          <div className="card-button__status card-button__status">
            <span
              className="card-button"
              style={buttonColorStyle(buttonType.cssColor)}
            >
              {buttonType.caption}
            </span>
          </div>
          <div className="card-button__name">
            {button.owner.name}
            <span className="card-button__username">
              {' '}
              @{button.owner.username}
            </span>
          </div>
        </div>
      </div>

      <div className="card-button__title">{button.title}</div>
      <div className="card-button-list__paragraph--small-card card-button-list__paragraph">
        <p>{button.description}</p>
      </div>
      {/* <div className="card-button__hashtags">
        {button.tags.map((tag, idx) => {
          return (
            <div className="hashtag" key={idx}>
              {tag}
            </div>
          );
        })}
      </div> */}
      {buttonType.customFields && buttonType.customFields.length > 0 && (
        <>
          <CardButtonCustomFields
            customFields={buttonType.customFields}
            button={button}
          />
        </>
      )}
      <div className="card-button__city card-button__everywhere ">
        {button.address}{' '}
        {button?.distance && (
          <> - {readableDistance(button?.distance)}</>
        )}
      </div>
    </div>
  );
}

// Pin of the map
export function CardButtonHeadSmall({ button }) {
  const { cssColor } = buttonTypes.find((buttonType) => {
    return buttonType.name === button.type;
  });
  return (
    <>
      <a href={`/ButtonFile/${button.id}`}>
        <div className="card-button-map__content">
          <div className="card-button-map__header">
            <div className="card-button-map__info">
              <div className="card-button__name">
                {button.owner.name}
              </div>

              <div className="card-button__status card-button__status">
                <span
                  className="card-button"
                  style={buttonColorStyle(cssColor)}
                >
                  {button.type}
                </span>
              </div>
            </div>
          </div>

          <div className="card-button__title">{button.title}</div>

          <div className="card-button__city card-button__everywhere ">
            {button.address}
          </div>
        </div>
      </a>
    </>
  );
}

function CardButtonSubmenu({ button }) {
  const config: SetupDtoOut = useRef(
    store,
    (state: GlobalState) => state.config,
  );
  const loggedInUser = useRef(
    store,
    (state: GlobalState) => state.loggedInUser,
    false,
  );

  const [linkButton, setLinkButton] = useState(null);
  useEffect(() => {
    if (config) {
      setLinkButton(() => {
        const shareLink = getShareLink(`/ButtonFile/${button.id}`);
        return shareLink;
      });
    }
  }, [config]);

  const FollowButtonMenuOption = (button) => {
    if (!canFollowButton(button, loggedInUser)) {
      return;
    }

    if (isFollowingButton(button, loggedInUser)) {
      return (
        <CardSubmenuOption
          onClick={() => {
            followButton(button.id);
          }}
          label={t('button.follow')}
        />
      );
    }
    return (
      <CardSubmenuOption
        onClick={() => {
          unFollowButton(button.id);
        }}
        label={t('button.unfollow')}
      />
    );
  };
  return (
    <CardSubmenu>
      <CardSubmenuOption
        onClick={() => {
          navigator.clipboard.writeText(linkButton);
        }}
        label={t('button.copy')}
      />
      {FollowButtonMenuOption(button)}
      {(isButtonOwner(loggedInUser, button) ||
        isAdmin(loggedInUser)) && (
        <>
          <CardSubmenuOption
            onClick={() => {
              router.push(`/ButtonEdit/${button.id}`);
            }}
            label={t('button.edit')}
          />
          <CardSubmenuOption
            onClick={() => {
              router.push(`/ButtonRemove/${button.id}`);
            }}
            label={t('button.delete')}
          />
        </>
      )}
    </CardSubmenu>
  );
}
export function CardButtonHeadBig({ button, buttonTypes }) {
  const { cssColor, caption, customFields } = buttonTypes.find(
    (buttonType) => {
      return buttonType.name === button.type;
    },
  );
  const loggedInUser = useRef(
    store,
    (state: GlobalState) => state.loggedInUser,
    false,
  );
  const [showMap, setShowMap] = useState(false);
  const profileHref = isButtonOwner(loggedInUser, button)
    ? `/Profile/`
    : `/p/${button.owner.username}`;
  return (
    <>
      <CardButtonSubmenu button={button} />

      <div className="card-button__content">
        <div className="card-button__header">
          <div className="card-button__avatar">
            <div className="avatar-big">
              <Link href={profileHref}>
                <ImageWrapper
                  imageType={ImageType.avatarBig}
                  src={button.owner.avatar}
                  alt="Avatar"
                />
              </Link>
            </div>
          </div>

          <div className="card-button__info">
            <div className="card-button__status card-button__status">
              <span
                className="card-button__status"
                style={buttonColorStyle(cssColor)}
              >
                {caption}
              </span>
            </div>
            <div className="card-button__name">
              <Link href={profileHref}>
                {button.owner.name}{' '}
                <span className="card-button__username">
                  {' '}
                  @{button.owner.username}
                </span>
              </Link>
            </div>
            <CardButtonHeadActions button={button} />
          </div>
        </div>

        <div className="card-button__title">
          {button.title}
          <FollowButtonHeart
            button={button}
            loggedInUser={loggedInUser}
          />
        </div>

        <div className="card-button__paragraph">
          {formatMessage(button.description)}
        </div>

        <div className="card-button__hashtags">
          {button.tags.map((tag, idx) => {
            return (
              <div
                className="hashtag"
                key={idx}
                onClick={() => {
                  filterTag(tag);
                  store.emit(new updateCurrentButton(null));
                  router.push('/Explore');
                }}
              >
                {tag}
              </div>
            );
          })}
        </div>
        {customFields && customFields.length > 0 && (
          <>
            <CardButtonCustomFields
              customFields={customFields}
              button={button}
            />
          </>
        )}
        <div className="card-button__locDate">
          <div
            className={
              'card-button__city card-button__everywhere' +
              (!button.hideAddress
                ? ' card-button__city--displayMap'
                : '')
            }
            onClick={() => setShowMap(() => !showMap)}
          >
            {button.address}
          </div>
        </div>
        {!button.hideAddress && showMap && (
          <MarkerSelectorMap
            markerPosition={[button.latitude, button.longitude]}
            setMarkerPosition={() => {}}
            zoom={10}
            markerColor={cssColor}
            markerImage={button.image}
            markerCaption={button.title}
          />
        )}
      </div>
    </>
  );
}

function ShowPhone({ button }) {
  const [showPhone, toggleShowPhone] = useState(false);
  const [phone, setPhone] = useState(null);
  const onCallClick = () => {
    if (phone == null) {
      store.emit(
        new GetPhone(
          button.id,
          (phone) => {
            setPhone(phone);
          },
          () => {},
        ),
      );
    }
    window.open('tel:' + phone);
  };
  const onShowPhoneClick = () => {
    if (phone == null) {
      store.emit(
        new GetPhone(
          button.id,
          (phone) => {
            setPhone(phone);
          },
          () => {},
        ),
      );
    }
    toggleShowPhone(!showPhone);
  };
  return (
    <>
      {button.hasPhone && (
        <>
          {!showPhone && (
            <Btn
              btnType={BtnType.filterCorp}
              contentAlignment={ContentAlignment.center}
              caption={t('button.showPhone')}
              iconLeft={IconType.circle}
              onClick={() => onShowPhoneClick()}
            />
          )}
          {showPhone && (
            <>
              <Btn
                btnType={BtnType.filterCorp}
                contentAlignment={ContentAlignment.center}
                iconLeft={IconType.circle}
                iconLink={<IoCallOutline />}
                submit={true}
                onClick={() => onCallClick()}
              />
              <div className="card-button__rating--phone">
                {phone}
              </div>
            </>
          )}
        </>
      )}
    </>
  );
}

export function CardButtonHeadActions({ button }) {
  return (
    <div className="card-button__rating">
      <ShowPhone button={button} />
      {button.hearts && (
        <span className="btn-circle__icon">
          <IoHeartOutline />
          {button.hearts}
        </span>
      )}

      {button.createdButtonsCount && (
        <span className="btn-circle__icon">
          <IoAddCircleOutline />
          {button.createdButtonsCount}
        </span>
      )}
    </div>
  );
}
export function CardButtonImages({ button }) {
  const images = button.images;

  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((currentIndex + 1) % images.length);
  };

  const prev = () => {
    setCurrentIndex(
      (currentIndex - 1 + images.length) % images.length,
    );
  };

  return (
    <>
      {button.images && (
        <div className="card-button__picture">
          {button.images.length > 1 && (
            <div className="card-button__picture-nav">
              <div className="arrow btn-circle__icon" onClick={prev}>
                <IoChevronBackOutline />
              </div>
              <div className="arrow btn-circle__icon" onClick={next}>
                <IoChevronForwardOutline />
              </div>
            </div>
          )}
          {images.map((image, idx) => (
            <div
              key={idx}
              className={
                images[currentIndex] === image ? 'show' : 'hide'
              }
            >
              <ImageWrapper
                imageType={ImageType.buttonCard}
                src={makeImageUrl(image)}
                alt={button.description}
              />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
export function CardButtonOptions() {
  return (
    <div className="card-button__options-menu">
      <div className="card-button__trigger">
        <div className="card-button__edit-icon card-button__submenu">
          {' '}
          <IoEllipsisHorizontalSharp />
        </div>
      </div>

      <div className="card-button__dropdown-container">
        <div className="card-button__dropdown-arrow"></div>
        <div className="card-button__dropdown-content">
          <div className="card-button__trigger-options">
            Editar botón
          </div>

          <button className="card-button__trigger-options card-button__trigger-button">
            Quitar botón de la red
          </button>

          <button className="card-button__trigger-options card-button__trigger-button">
            Borrar botón
          </button>

          <button className="card-button__trigger-options card-button__trigger-button">
            Compartir botón
          </button>

          <button className="card-button__trigger-options card-button__trigger-button">
            Reportar botón
          </button>
        </div>
      </div>
    </div>
  );
}

function FollowButtonHeart({ button, loggedInUser }) {
  if (!canFollowButton(button, loggedInUser)) {
    return;
  }

  if (isFollowingButton(button, loggedInUser)) {
    return (
      <Btn
        btnType={BtnType.iconActions}
        contentAlignment={ContentAlignment.center}
        iconLink={<IoHeartOutline />}
        iconLeft={IconType.circle}
        onClick={() => followButton(button.id)}
      />
    );
  }

  return (
    <Btn
      btnType={BtnType.iconActions}
      contentAlignment={ContentAlignment.center}
      iconLink={<IoHeart />}
      iconLeft={IconType.circle}
      onClick={() => unFollowButton(button.id)}
    />
  );
}

const canFollowButton = (button, user) => {
  if (!user) {
    return false;
  }

  if (user.id == button.owner.id) {
    return false;
  }
  return true;
};

const isFollowingButton = (button, user) => {
  return button.followedBy.indexOf(user.id) < 0;
};

const followButton = (buttonId) => {
  store.emit(
    new FollowButton(
      buttonId,
      () => alertService.success(t('button.followAlert')),
      () => {
        alertService.warn(t('button.followErrorAlert'));
      },
    ),
  );
};

const unFollowButton = (buttonId) => {
  store.emit(
    new UnfollowButton(
      buttonId,
      () => alertService.info(t('button.unfollowAlert')),
      () => {
        alertService.warn(t('button.unfollowErrorAlert'));
      },
    ),
  );
};
function isButtonOwner(loggedInUser, button) {
  return (
    loggedInUser && loggedInUser.username == button.owner.username
  );
}
