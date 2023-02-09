//FEED SECTION - HERE COMME ALL THE NOTIFFICATIONS, MESSAGES and CONVERSATION LINKS FROM EXTERNAL RESOURCES
import Dropdown from 'elements/Dropdown/DropDown';
import CardNotification from '../../components/feed/CardNotification'

export default function FeedProfile() {
  return (

    <div className="feed-container">

      <div className="feed-selector">

          <Dropdown/>

      </div>

      <div className="feed-line"></div>

      <div className="feed-section">

        <div className="feed-element">

          <CardNotification />

        </div>

        <div className="feed-element">

          <CardNotification />

        </div>

        <div className="feed-element">

          <CardNotification />

        </div>

      </div>

    </div>

  );
}
