import { Injectable } from '@angular/core';
import { Post } from '../posts/post.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
const BACKEND_URL = environment.apiUrl + '/posts';
@Injectable({
  providedIn: 'root',
})
export class PostService {
  private posts: Post[] = [];

  private postsUpdated = new Subject<Post[]>();
  public err = new BehaviorSubject<any>(null);
  constructor(private http: HttpClient, private router: Router) {}

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, imgpath: File, postDate: Date) {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    postData.append('image', imgpath, title);
    postData.append('postDate', postDate.toString());
    this.http
      .post<{ message: string; post: Post }>(BACKEND_URL, postData)
      .subscribe((responseData) => {
        this.err.next(null);
        this.router.navigate(['/']);
      }),
      (err: any) => {
        this.err.next(err);
      };
  }

  getPosts() {
    this.http
      .get<{ message: string; posts: any }>(BACKEND_URL)
      .pipe(
        map((postData) => {
          return postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              postDate: post.postDate,
              likes: post.likes,
              comments: post.comments,
              likeCount: post.likeCount,
            };
          });
        })
      )
      .subscribe(
        (transformedPosts) => {
          this.err.next(null);

          this.posts = transformedPosts;
          this.postsUpdated.next([...this.posts]);
        },
        (err) => {
          this.err.next(err);
        }
      );
  }

  getPost(id: string) {
    return this.http.get<{
      _id: string;
      title: string;
      content: string;
      imagePath: string;
      creator: string;
      postDate: string;
      likes: string;
      comments: [];
      likeCount: number;
    }>(BACKEND_URL + '/' + id);
  }

  getMyPost(id: string) {
    this.http
      .get<{ message: string; posts: any }>(BACKEND_URL + '/mypost')
      .pipe(
        map((postData) => {
          return postData.posts.map((post: any) => {
            return {
              title: post.title,
              content: post.content,
              id: post._id,
              imagePath: post.imagePath,
              creator: post.creator,
              postDate: post.postDate,
              likes: post.likes,
              comments: post.comments,
              likeCount: post.likeCount,
            };
          });
        })
      )
      .subscribe(
        (transformedPosts) => {
          this.err.next(null);

          this.posts = transformedPosts;
          this.postsUpdated.next([...this.posts]);
        },
        (err) => {
          this.err.next(err);
        }
      );
  }

  updatePost(id: string, title: string, content: string, image: File | string) {
    let postData: Post | FormData;
    if (typeof image === 'object') {
      postData = new FormData();
      postData.append('id', id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = {
        id: id,
        title: title,
        content: content,
        imagePath: image,
        creator: '',
        likes: [],
        comments: [],
        likeCount: 0,
      };
    }
    this.http.put(BACKEND_URL + '/' + id, postData).subscribe(
      (response) => {
        this.err.next(null);
        this.router.navigate(['/myposts']);
      },
      (err) => {
        this.err.next(err);
      }
    );
  }

  deletePost(postId: string) {
    this.http.delete(BACKEND_URL + '/' + postId).subscribe(
      (data) => {
        this.err.next(null);
        const updatedPosts = this.posts.filter((post) => post.id !== postId);
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
        this.router.navigate(['/']);
      },
      (e) => {
        this.err.next(e);
      }
    );
  }

  likePost(postId: string) {
    this.http
      .get<{ success: boolean; message: string; likeCount: number }>(
        `${BACKEND_URL}/${postId}/likes`
      )
      .subscribe(
        (responseData) => {
          const updatedPost = this.posts.find((post) => post.id === postId);
          if (updatedPost) {
            updatedPost.likes = responseData.success
              ? updatedPost.likes.filter(
                  (userId) => userId !== responseData.message
                )
              : [...updatedPost.likes, responseData.message];
            updatedPost.likeCount = responseData.likeCount;
            // window.location.reload();
            this.postsUpdated.next([...this.posts]);
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }

  addComment(postId: string, comment: string) {
    const commentData = { comment };
    this.http
      .post<{ success: boolean; message: string; comment: any }>(
        `${BACKEND_URL}/${postId}/comment`,
        commentData
      )
      .subscribe(
        (responseData) => {
          const updatedPost = this.posts.find((post) => post.id === postId);
          if (updatedPost) {
            updatedPost.comments.unshift(responseData.comment);
            this.postsUpdated.next([...this.posts]);
          }
        },
        (error) => {
          console.error(error);
        }
      );
  }
}
