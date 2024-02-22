import Btn, {
  BtnType,
  ContentAlignment,
  IconType,
} from 'elements/Btn';
import { store } from 'pages';
import { DeleteComment } from 'state/Posts';
import { alertService } from 'services/Alert';
import { isAdmin } from 'state/Users';
import {
  IoChatbubbleEllipsesSharp,
  IoMailOutline,
  IoTrashBinOutline,
} from 'react-icons/io5';
import { readableTimeLeftToDate } from 'shared/date.utils';
import ImageWrapper, { ImageType } from 'elements/ImageWrapper';
import { CommentPrivacyOptions } from 'shared/types/privacy.enum';
import { formatMessage, mentionsOfMessage } from 'elements/Message';
import { uniqueArray } from 'shared/sys.helper';
import { Compose } from 'layouts/Feed';
import { useState } from 'react';
import { useToggle } from 'shared/custom.hooks';

export default function PostComments({
  comments,
  reloadPosts,
  loggedInUser,
  isButtonOwner,
  post,
}) {
  const commentParentIds = comments.filter(
    (comment) => comment.commentParentId,
  );
  return (
    <>
      <>
        {comments.length > 0 && (
          <>
            {comments
              .filter((comment) => !comment.commentParentId)
              .map((comment, key) => {
                return (
                  <PostComment
                    key={key}
                    comment={comment}
                    loggedInUser={loggedInUser}
                    isButtonOwner={isButtonOwner}
                    reloadPosts={reloadPosts}
                    post={post}
                    replies={commentParentIds.filter(
                      (reply) => reply.commentParentId == comment.id,
                    )}
                  />
                );
              })}
          </>
        )}
      </>
    </>
  );
}
enum ComposeCommentState {
  HIDE,
  PRIVATE,
  PUBLIC,
}

export function PostComment({
  comment,
  loggedInUser,
  isButtonOwner,
  reloadPosts,
  post,
  replies,
  isReply = false
}) {
  const deleteComment = (commentId) => {
    store.emit(
      new DeleteComment(commentId, reloadPosts, (error) => {
        alertService.error(error.caption);
      }),
    );
  };
  const [showComposeComment, setShowComposeComment] =
    useState<ComposeCommentState>(ComposeCommentState.HIDE);

  const toggleShowComposeComment = (privacy: ComposeCommentState) => {
    if (showComposeComment == ComposeCommentState.HIDE) {
      setShowComposeComment(() => privacy);
    } else {
      setShowComposeComment(() => ComposeCommentState.HIDE);
    }
  };
  return (
    <div
      className={
        'card-notification--comment ' +
        (comment.privacy == CommentPrivacyOptions.PRIVATE
          ? ' card-notification--comment-private'
          : '')
        + (isReply ? ' card-notification--reply' : '')
      }
    >
      <Comment comment={comment} />
      
      <div className="message__actions">
        {(comment.privacy == CommentPrivacyOptions.PRIVATE) && (
          <Btn
            submit={false}
            btnType={BtnType.iconActions}
            iconLink={<IoMailOutline />}
            iconLeft={IconType.circle}
            contentAlignment={ContentAlignment.right}
            onClick={() =>
              toggleShowComposeComment(ComposeCommentState.PRIVATE)
            }
          />
        )}
        {(comment.privacy == CommentPrivacyOptions.PUBLIC) && (
          <Btn
            submit={false}
            btnType={BtnType.iconActions}
            iconLink={<IoMailOutline />}
            iconLeft={IconType.circle}
            contentAlignment={ContentAlignment.right}
            onClick={() =>
              toggleShowComposeComment(ComposeCommentState.PUBLIC)
            }
          />
        )}

        {loggedInUser &&
          (loggedInUser.id == comment.author.id ||
            isButtonOwner ||
            isAdmin(loggedInUser)) && (
            <Btn
              submit={true}
              btnType={BtnType.iconActions}
              iconLink={<IoTrashBinOutline />}
              iconLeft={IconType.circle}
              contentAlignment={ContentAlignment.right}
              onClick={() => deleteComment(comment.id)}
            />
          )}
      </div>
      {(showComposeComment != ComposeCommentState.HIDE) && (
        <Compose
          referer={{
            post: post.id,
            comment: comment.commentParentId ? comment.commentParentId : comment.id,
            privateMessage:
              ComposeCommentState.PRIVATE == showComposeComment,
            mentions: [
              ...[comment.author.username],
              ...mentionsOfMessage(comment.message),
            ],
          }}
          onCreate={() => {
            reloadPosts();
            toggleShowComposeComment(ComposeCommentState.HIDE);
          }}
          onCancel={() => {
            toggleShowComposeComment(ComposeCommentState.HIDE);
          }}
        />
      )}
     
      {replies.length > 0 && (
        <>
          {replies.map((reply, key) => {
            return (
              <PostComment
                isReply={true}
                key={key}
                comment={reply}
                loggedInUser={loggedInUser}
                isButtonOwner={isButtonOwner}
                reloadPosts={reloadPosts}
                post={post}
                replies={[]}
              />
            );
          })}
        </>
      )}

      
    </div>
  );
}
export function Comment({ comment }) {
  return (
    <>
      <div className="message message--others">
        <div className="message__header">
          <div className="message__user-name-container">
            <p className="message__author">
              <span className="message__name">
                {comment.author.name}
              </span>{' '}
              @{comment.author.username}
            </p>
          </div>
        </div>

        <div className="message__content">
          {formatMessage(comment.message)}
        </div>

        <div className="message__hour">
          {readableTimeLeftToDate(comment.created_at)},{' '}
          {comment.privacy == CommentPrivacyOptions.PRIVATE && (
            <span style={{ color: 'red' }}>private</span>
          )}
        </div>

        <div className="message__avatar">
          <ImageWrapper
            imageType={ImageType.avatar}
            src={comment.author.avatar}
            alt="Avatar"
          />
        </div>
      </div>
    </>
  );
}
