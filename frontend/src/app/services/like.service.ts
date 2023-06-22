import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LikeService {
  likedPosts: string[] = [];

  constructor() {}

  addLikedPost(postId: string) {
    this.likedPosts.push(postId);
    window.location.reload();
  }

  removeLikedPost(postId: string) {
    const index = this.likedPosts.indexOf(postId);
    if (index !== -1) {
      this.likedPosts.splice(index, 1);
    }
  }

  isPostLiked(postId: string): boolean {
    return this.likedPosts.includes(postId);
  }
}
