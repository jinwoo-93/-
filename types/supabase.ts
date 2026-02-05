export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      Account: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id: string
          id_token: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id: string
          id_token?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          userId: string
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id?: string
          id_token?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Account_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      AdBid: {
        Row: {
          bidAmount: number
          createdAt: string
          id: string
          isWinner: boolean
          postId: string | null
          slotId: string
          status: Database["public"]["Enums"]["BidStatus"]
          userId: string
          weekEnd: string
          weekStart: string
          winPosition: number | null
        }
        Insert: {
          bidAmount: number
          createdAt?: string
          id: string
          isWinner?: boolean
          postId?: string | null
          slotId: string
          status?: Database["public"]["Enums"]["BidStatus"]
          userId: string
          weekEnd: string
          weekStart: string
          winPosition?: number | null
        }
        Update: {
          bidAmount?: number
          createdAt?: string
          id?: string
          isWinner?: boolean
          postId?: string | null
          slotId?: string
          status?: Database["public"]["Enums"]["BidStatus"]
          userId?: string
          weekEnd?: string
          weekStart?: string
          winPosition?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "AdBid_slotId_fkey"
            columns: ["slotId"]
            isOneToOne: false
            referencedRelation: "AdSlot"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "AdBid_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      AdSlot: {
        Row: {
          categoryId: string
          id: string
          position: number
          slotType: Database["public"]["Enums"]["SlotType"]
        }
        Insert: {
          categoryId: string
          id: string
          position: number
          slotType: Database["public"]["Enums"]["SlotType"]
        }
        Update: {
          categoryId?: string
          id?: string
          position?: number
          slotType?: Database["public"]["Enums"]["SlotType"]
        }
        Relationships: [
          {
            foreignKeyName: "AdSlot_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
        ]
      }
      Category: {
        Row: {
          createdAt: string
          icon: string | null
          id: string
          nameKo: string
          nameZh: string
          parentId: string | null
          slug: string
        }
        Insert: {
          createdAt?: string
          icon?: string | null
          id: string
          nameKo: string
          nameZh: string
          parentId?: string | null
          slug: string
        }
        Update: {
          createdAt?: string
          icon?: string | null
          id?: string
          nameKo?: string
          nameZh?: string
          parentId?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "Category_parentId_fkey"
            columns: ["parentId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
        ]
      }
      ChatRoom: {
        Row: {
          createdAt: string
          id: string
          lastMessage: string | null
          lastMessageAt: string | null
          orderId: string | null
          participant1Id: string
          participant2Id: string
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          id: string
          lastMessage?: string | null
          lastMessageAt?: string | null
          orderId?: string | null
          participant1Id: string
          participant2Id: string
          updatedAt: string
        }
        Update: {
          createdAt?: string
          id?: string
          lastMessage?: string | null
          lastMessageAt?: string | null
          orderId?: string | null
          participant1Id?: string
          participant2Id?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Coupon: {
        Row: {
          categoryId: string | null
          code: string
          createdAt: string
          discountType: Database["public"]["Enums"]["DiscountType"]
          discountValue: number
          id: string
          isActive: boolean
          maxDiscount: number | null
          minOrderAmount: number
          name: string
          nameZh: string | null
          sellerId: string | null
          totalQuantity: number
          tradeDirection: string | null
          updatedAt: string
          usageLimit: number
          usedQuantity: number
          validFrom: string
          validUntil: string
        }
        Insert: {
          categoryId?: string | null
          code: string
          createdAt?: string
          discountType: Database["public"]["Enums"]["DiscountType"]
          discountValue: number
          id: string
          isActive?: boolean
          maxDiscount?: number | null
          minOrderAmount?: number
          name: string
          nameZh?: string | null
          sellerId?: string | null
          totalQuantity?: number
          tradeDirection?: string | null
          updatedAt: string
          usageLimit?: number
          usedQuantity?: number
          validFrom?: string
          validUntil: string
        }
        Update: {
          categoryId?: string | null
          code?: string
          createdAt?: string
          discountType?: Database["public"]["Enums"]["DiscountType"]
          discountValue?: number
          id?: string
          isActive?: boolean
          maxDiscount?: number | null
          minOrderAmount?: number
          name?: string
          nameZh?: string | null
          sellerId?: string | null
          totalQuantity?: number
          tradeDirection?: string | null
          updatedAt?: string
          usageLimit?: number
          usedQuantity?: number
          validFrom?: string
          validUntil?: string
        }
        Relationships: []
      }
      Dispute: {
        Row: {
          buyerRefundRate: number | null
          createdAt: string
          description: string
          evidence: string[] | null
          id: string
          initiatorId: string
          orderId: string
          reason: string
          resolvedAt: string | null
          status: Database["public"]["Enums"]["DisputeStatus"]
          updatedAt: string
          votesForBuyer: number
          votesForSeller: number
        }
        Insert: {
          buyerRefundRate?: number | null
          createdAt?: string
          description: string
          evidence?: string[] | null
          id: string
          initiatorId: string
          orderId: string
          reason: string
          resolvedAt?: string | null
          status?: Database["public"]["Enums"]["DisputeStatus"]
          updatedAt: string
          votesForBuyer?: number
          votesForSeller?: number
        }
        Update: {
          buyerRefundRate?: number | null
          createdAt?: string
          description?: string
          evidence?: string[] | null
          id?: string
          initiatorId?: string
          orderId?: string
          reason?: string
          resolvedAt?: string | null
          status?: Database["public"]["Enums"]["DisputeStatus"]
          updatedAt?: string
          votesForBuyer?: number
          votesForSeller?: number
        }
        Relationships: [
          {
            foreignKeyName: "Dispute_initiatorId_fkey"
            columns: ["initiatorId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Dispute_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "Order"
            referencedColumns: ["id"]
          },
        ]
      }
      DisputeVote: {
        Row: {
          comment: string | null
          createdAt: string
          disputeId: string
          id: string
          voteFor: Database["public"]["Enums"]["VoteFor"]
          voterId: string
        }
        Insert: {
          comment?: string | null
          createdAt?: string
          disputeId: string
          id: string
          voteFor: Database["public"]["Enums"]["VoteFor"]
          voterId: string
        }
        Update: {
          comment?: string | null
          createdAt?: string
          disputeId?: string
          id?: string
          voteFor?: Database["public"]["Enums"]["VoteFor"]
          voterId?: string
        }
        Relationships: [
          {
            foreignKeyName: "DisputeVote_disputeId_fkey"
            columns: ["disputeId"]
            isOneToOne: false
            referencedRelation: "Dispute"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "DisputeVote_voterId_fkey"
            columns: ["voterId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ExchangeRate: {
        Row: {
          fromCurrency: string
          id: string
          rate: number
          toCurrency: string
          updatedAt: string
        }
        Insert: {
          fromCurrency: string
          id: string
          rate: number
          toCurrency: string
          updatedAt?: string
        }
        Update: {
          fromCurrency?: string
          id?: string
          rate?: number
          toCurrency?: string
          updatedAt?: string
        }
        Relationships: []
      }
      Follow: {
        Row: {
          createdAt: string
          followerId: string
          followingId: string
          id: string
        }
        Insert: {
          createdAt?: string
          followerId: string
          followingId: string
          id: string
        }
        Update: {
          createdAt?: string
          followerId?: string
          followingId?: string
          id?: string
        }
        Relationships: []
      }
      LiveProduct: {
        Row: {
          clickCount: number
          createdAt: string
          displayOrder: number
          id: string
          livePrice: number | null
          livePriceCNY: number | null
          orderCount: number
          postId: string
          streamId: string
        }
        Insert: {
          clickCount?: number
          createdAt?: string
          displayOrder?: number
          id: string
          livePrice?: number | null
          livePriceCNY?: number | null
          orderCount?: number
          postId: string
          streamId: string
        }
        Update: {
          clickCount?: number
          createdAt?: string
          displayOrder?: number
          id?: string
          livePrice?: number | null
          livePriceCNY?: number | null
          orderCount?: number
          postId?: string
          streamId?: string
        }
        Relationships: [
          {
            foreignKeyName: "LiveProduct_streamId_fkey"
            columns: ["streamId"]
            isOneToOne: false
            referencedRelation: "LiveStream"
            referencedColumns: ["id"]
          },
        ]
      }
      LiveStream: {
        Row: {
          createdAt: string
          description: string | null
          descriptionZh: string | null
          endedAt: string | null
          hostId: string
          id: string
          peakViewers: number
          scheduledAt: string | null
          startedAt: string | null
          status: Database["public"]["Enums"]["LiveStatus"]
          streamKey: string
          streamUrl: string | null
          thumbnail: string | null
          title: string
          titleZh: string | null
          totalViews: number
          updatedAt: string
          viewerCount: number
        }
        Insert: {
          createdAt?: string
          description?: string | null
          descriptionZh?: string | null
          endedAt?: string | null
          hostId: string
          id: string
          peakViewers?: number
          scheduledAt?: string | null
          startedAt?: string | null
          status?: Database["public"]["Enums"]["LiveStatus"]
          streamKey: string
          streamUrl?: string | null
          thumbnail?: string | null
          title: string
          titleZh?: string | null
          totalViews?: number
          updatedAt: string
          viewerCount?: number
        }
        Update: {
          createdAt?: string
          description?: string | null
          descriptionZh?: string | null
          endedAt?: string | null
          hostId?: string
          id?: string
          peakViewers?: number
          scheduledAt?: string | null
          startedAt?: string | null
          status?: Database["public"]["Enums"]["LiveStatus"]
          streamKey?: string
          streamUrl?: string | null
          thumbnail?: string | null
          title?: string
          titleZh?: string | null
          totalViews?: number
          updatedAt?: string
          viewerCount?: number
        }
        Relationships: []
      }
      Message: {
        Row: {
          chatRoomId: string | null
          content: string
          createdAt: string
          id: string
          images: string[] | null
          isRead: boolean
          messageType: Database["public"]["Enums"]["MessageType"]
          readAt: string | null
          receiverId: string
          senderId: string
        }
        Insert: {
          chatRoomId?: string | null
          content: string
          createdAt?: string
          id: string
          images?: string[] | null
          isRead?: boolean
          messageType?: Database["public"]["Enums"]["MessageType"]
          readAt?: string | null
          receiverId: string
          senderId: string
        }
        Update: {
          chatRoomId?: string | null
          content?: string
          createdAt?: string
          id?: string
          images?: string[] | null
          isRead?: boolean
          messageType?: Database["public"]["Enums"]["MessageType"]
          readAt?: string | null
          receiverId?: string
          senderId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Message_chatRoomId_fkey"
            columns: ["chatRoomId"]
            isOneToOne: false
            referencedRelation: "ChatRoom"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Message_receiverId_fkey"
            columns: ["receiverId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Message_senderId_fkey"
            columns: ["senderId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Notification: {
        Row: {
          createdAt: string
          id: string
          isRead: boolean
          link: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["NotificationType"]
          userId: string
        }
        Insert: {
          createdAt?: string
          id: string
          isRead?: boolean
          link?: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["NotificationType"]
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          isRead?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["NotificationType"]
          userId?: string
        }
        Relationships: []
      }
      NotificationSettings: {
        Row: {
          createdAt: string
          doNotDisturbEnd: string | null
          doNotDisturbStart: string | null
          emailDispute: boolean
          emailEnabled: boolean
          emailMarketing: boolean
          emailOrder: boolean
          emailPayment: boolean
          emailReview: boolean
          emailShipping: boolean
          id: string
          pushChat: boolean
          pushDispute: boolean
          pushEnabled: boolean
          pushMarketing: boolean
          pushOrder: boolean
          pushPayment: boolean
          pushReview: boolean
          pushShipping: boolean
          updatedAt: string
          userId: string
        }
        Insert: {
          createdAt?: string
          doNotDisturbEnd?: string | null
          doNotDisturbStart?: string | null
          emailDispute?: boolean
          emailEnabled?: boolean
          emailMarketing?: boolean
          emailOrder?: boolean
          emailPayment?: boolean
          emailReview?: boolean
          emailShipping?: boolean
          id: string
          pushChat?: boolean
          pushDispute?: boolean
          pushEnabled?: boolean
          pushMarketing?: boolean
          pushOrder?: boolean
          pushPayment?: boolean
          pushReview?: boolean
          pushShipping?: boolean
          updatedAt: string
          userId: string
        }
        Update: {
          createdAt?: string
          doNotDisturbEnd?: string | null
          doNotDisturbStart?: string | null
          emailDispute?: boolean
          emailEnabled?: boolean
          emailMarketing?: boolean
          emailOrder?: boolean
          emailPayment?: boolean
          emailReview?: boolean
          emailShipping?: boolean
          id?: string
          pushChat?: boolean
          pushDispute?: boolean
          pushEnabled?: boolean
          pushMarketing?: boolean
          pushOrder?: boolean
          pushPayment?: boolean
          pushReview?: boolean
          pushShipping?: boolean
          updatedAt?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "NotificationSettings_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      Order: {
        Row: {
          buyerId: string
          confirmedAt: string | null
          createdAt: string
          deliveredAt: string | null
          feeRate: number
          id: string
          itemPriceCNY: number
          itemPriceKRW: number
          orderNumber: string
          paidAt: string | null
          platformFeeCNY: number
          platformFeeKRW: number
          postId: string
          preShipPhotos: string[] | null
          quantity: number
          sellerId: string
          shippedAt: string | null
          shippingAddress: Json
          shippingCompanyId: string | null
          shippingFeeCNY: number
          shippingFeeKRW: number
          status: Database["public"]["Enums"]["OrderStatus"]
          totalCNY: number
          totalKRW: number
          trackingNumber: string | null
          updatedAt: string
        }
        Insert: {
          buyerId: string
          confirmedAt?: string | null
          createdAt?: string
          deliveredAt?: string | null
          feeRate: number
          id: string
          itemPriceCNY: number
          itemPriceKRW: number
          orderNumber: string
          paidAt?: string | null
          platformFeeCNY: number
          platformFeeKRW: number
          postId: string
          preShipPhotos?: string[] | null
          quantity: number
          sellerId: string
          shippedAt?: string | null
          shippingAddress: Json
          shippingCompanyId?: string | null
          shippingFeeCNY: number
          shippingFeeKRW: number
          status?: Database["public"]["Enums"]["OrderStatus"]
          totalCNY: number
          totalKRW: number
          trackingNumber?: string | null
          updatedAt: string
        }
        Update: {
          buyerId?: string
          confirmedAt?: string | null
          createdAt?: string
          deliveredAt?: string | null
          feeRate?: number
          id?: string
          itemPriceCNY?: number
          itemPriceKRW?: number
          orderNumber?: string
          paidAt?: string | null
          platformFeeCNY?: number
          platformFeeKRW?: number
          postId?: string
          preShipPhotos?: string[] | null
          quantity?: number
          sellerId?: string
          shippedAt?: string | null
          shippingAddress?: Json
          shippingCompanyId?: string | null
          shippingFeeCNY?: number
          shippingFeeKRW?: number
          status?: Database["public"]["Enums"]["OrderStatus"]
          totalCNY?: number
          totalKRW?: number
          trackingNumber?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Order_buyerId_fkey"
            columns: ["buyerId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Order_postId_fkey"
            columns: ["postId"]
            isOneToOne: false
            referencedRelation: "Post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Order_sellerId_fkey"
            columns: ["sellerId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Order_shippingCompanyId_fkey"
            columns: ["shippingCompanyId"]
            isOneToOne: false
            referencedRelation: "ShippingCompany"
            referencedColumns: ["id"]
          },
        ]
      }
      Payment: {
        Row: {
          amountCNY: number
          amountKRW: number
          createdAt: string
          currency: string
          escrowReleasedAt: string | null
          id: string
          orderId: string
          paymentGateway: string
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"]
          status: Database["public"]["Enums"]["PaymentStatus"]
          transactionId: string | null
          updatedAt: string
        }
        Insert: {
          amountCNY: number
          amountKRW: number
          createdAt?: string
          currency: string
          escrowReleasedAt?: string | null
          id: string
          orderId: string
          paymentGateway: string
          paymentMethod: Database["public"]["Enums"]["PaymentMethod"]
          status?: Database["public"]["Enums"]["PaymentStatus"]
          transactionId?: string | null
          updatedAt: string
        }
        Update: {
          amountCNY?: number
          amountKRW?: number
          createdAt?: string
          currency?: string
          escrowReleasedAt?: string | null
          id?: string
          orderId?: string
          paymentGateway?: string
          paymentMethod?: Database["public"]["Enums"]["PaymentMethod"]
          status?: Database["public"]["Enums"]["PaymentStatus"]
          transactionId?: string | null
          updatedAt?: string
        }
        Relationships: [
          {
            foreignKeyName: "Payment_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "Order"
            referencedColumns: ["id"]
          },
        ]
      }
      PointHistory: {
        Row: {
          amount: number
          balance: number
          couponId: string | null
          createdAt: string
          description: string
          descriptionZh: string | null
          disputeId: string | null
          expiresAt: string | null
          id: string
          isExpired: boolean
          orderId: string | null
          type: Database["public"]["Enums"]["PointType"]
          userPointId: string
        }
        Insert: {
          amount: number
          balance: number
          couponId?: string | null
          createdAt?: string
          description: string
          descriptionZh?: string | null
          disputeId?: string | null
          expiresAt?: string | null
          id: string
          isExpired?: boolean
          orderId?: string | null
          type: Database["public"]["Enums"]["PointType"]
          userPointId: string
        }
        Update: {
          amount?: number
          balance?: number
          couponId?: string | null
          createdAt?: string
          description?: string
          descriptionZh?: string | null
          disputeId?: string | null
          expiresAt?: string | null
          id?: string
          isExpired?: boolean
          orderId?: string | null
          type?: Database["public"]["Enums"]["PointType"]
          userPointId?: string
        }
        Relationships: [
          {
            foreignKeyName: "PointHistory_userPointId_fkey"
            columns: ["userPointId"]
            isOneToOne: false
            referencedRelation: "UserPoint"
            referencedColumns: ["id"]
          },
        ]
      }
      Post: {
        Row: {
          categoryId: string
          createdAt: string
          description: string
          descriptionZh: string | null
          expiresAt: string | null
          id: string
          images: string[] | null
          postType: Database["public"]["Enums"]["PostType"]
          priceCNY: number
          priceKRW: number
          quantity: number
          reorderRate: number
          salesCount: number
          status: Database["public"]["Enums"]["PostStatus"]
          title: string
          titleZh: string | null
          tradeDirection: Database["public"]["Enums"]["TradeDirection"]
          updatedAt: string
          userId: string
          viewCount: number
        }
        Insert: {
          categoryId: string
          createdAt?: string
          description: string
          descriptionZh?: string | null
          expiresAt?: string | null
          id: string
          images?: string[] | null
          postType: Database["public"]["Enums"]["PostType"]
          priceCNY: number
          priceKRW: number
          quantity?: number
          reorderRate?: number
          salesCount?: number
          status?: Database["public"]["Enums"]["PostStatus"]
          title: string
          titleZh?: string | null
          tradeDirection: Database["public"]["Enums"]["TradeDirection"]
          updatedAt: string
          userId: string
          viewCount?: number
        }
        Update: {
          categoryId?: string
          createdAt?: string
          description?: string
          descriptionZh?: string | null
          expiresAt?: string | null
          id?: string
          images?: string[] | null
          postType?: Database["public"]["Enums"]["PostType"]
          priceCNY?: number
          priceKRW?: number
          quantity?: number
          reorderRate?: number
          salesCount?: number
          status?: Database["public"]["Enums"]["PostStatus"]
          title?: string
          titleZh?: string | null
          tradeDirection?: Database["public"]["Enums"]["TradeDirection"]
          updatedAt?: string
          userId?: string
          viewCount?: number
        }
        Relationships: [
          {
            foreignKeyName: "Post_categoryId_fkey"
            columns: ["categoryId"]
            isOneToOne: false
            referencedRelation: "Category"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Post_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ProductQA: {
        Row: {
          answer: string | null
          answeredAt: string | null
          answeredBy: string | null
          answerZh: string | null
          createdAt: string
          id: string
          isPrivate: boolean
          postId: string
          question: string
          questionZh: string | null
          status: Database["public"]["Enums"]["QAStatus"]
          updatedAt: string
          userId: string
        }
        Insert: {
          answer?: string | null
          answeredAt?: string | null
          answeredBy?: string | null
          answerZh?: string | null
          createdAt?: string
          id: string
          isPrivate?: boolean
          postId: string
          question: string
          questionZh?: string | null
          status?: Database["public"]["Enums"]["QAStatus"]
          updatedAt: string
          userId: string
        }
        Update: {
          answer?: string | null
          answeredAt?: string | null
          answeredBy?: string | null
          answerZh?: string | null
          createdAt?: string
          id?: string
          isPrivate?: boolean
          postId?: string
          question?: string
          questionZh?: string | null
          status?: Database["public"]["Enums"]["QAStatus"]
          updatedAt?: string
          userId?: string
        }
        Relationships: []
      }
      PurchaseOffer: {
        Row: {
          createdAt: string
          estimatedDays: number
          id: string
          message: string | null
          messageZh: string | null
          priceCNY: number
          priceKRW: number
          requestId: string
          sellerId: string
          shippingFeeCNY: number
          shippingFeeKRW: number
          status: Database["public"]["Enums"]["OfferStatus"]
        }
        Insert: {
          createdAt?: string
          estimatedDays: number
          id: string
          message?: string | null
          messageZh?: string | null
          priceCNY: number
          priceKRW: number
          requestId: string
          sellerId: string
          shippingFeeCNY: number
          shippingFeeKRW: number
          status?: Database["public"]["Enums"]["OfferStatus"]
        }
        Update: {
          createdAt?: string
          estimatedDays?: number
          id?: string
          message?: string | null
          messageZh?: string | null
          priceCNY?: number
          priceKRW?: number
          requestId?: string
          sellerId?: string
          shippingFeeCNY?: number
          shippingFeeKRW?: number
          status?: Database["public"]["Enums"]["OfferStatus"]
        }
        Relationships: [
          {
            foreignKeyName: "PurchaseOffer_requestId_fkey"
            columns: ["requestId"]
            isOneToOne: false
            referencedRelation: "PurchaseRequest"
            referencedColumns: ["id"]
          },
        ]
      }
      PurchaseRequest: {
        Row: {
          createdAt: string
          deadline: string | null
          description: string | null
          descriptionZh: string | null
          estimatedPrice: number | null
          id: string
          maxBudget: number | null
          productImage: string | null
          productName: string
          productNameZh: string | null
          productUrl: string | null
          quantity: number
          requesterId: string
          selectedOfferId: string | null
          status: Database["public"]["Enums"]["PurchaseRequestStatus"]
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          deadline?: string | null
          description?: string | null
          descriptionZh?: string | null
          estimatedPrice?: number | null
          id: string
          maxBudget?: number | null
          productImage?: string | null
          productName: string
          productNameZh?: string | null
          productUrl?: string | null
          quantity?: number
          requesterId: string
          selectedOfferId?: string | null
          status?: Database["public"]["Enums"]["PurchaseRequestStatus"]
          updatedAt: string
        }
        Update: {
          createdAt?: string
          deadline?: string | null
          description?: string | null
          descriptionZh?: string | null
          estimatedPrice?: number | null
          id?: string
          maxBudget?: number | null
          productImage?: string | null
          productName?: string
          productNameZh?: string | null
          productUrl?: string | null
          quantity?: number
          requesterId?: string
          selectedOfferId?: string | null
          status?: Database["public"]["Enums"]["PurchaseRequestStatus"]
          updatedAt?: string
        }
        Relationships: []
      }
      Report: {
        Row: {
          createdAt: string
          description: string | null
          evidence: string[] | null
          handledAt: string | null
          handledBy: string | null
          id: string
          postId: string | null
          reason: Database["public"]["Enums"]["ReportReason"]
          reporterId: string
          resolution: string | null
          status: Database["public"]["Enums"]["ReportStatus"]
          targetType: Database["public"]["Enums"]["ReportTarget"]
          targetUserId: string | null
          updatedAt: string
        }
        Insert: {
          createdAt?: string
          description?: string | null
          evidence?: string[] | null
          handledAt?: string | null
          handledBy?: string | null
          id: string
          postId?: string | null
          reason: Database["public"]["Enums"]["ReportReason"]
          reporterId: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["ReportStatus"]
          targetType: Database["public"]["Enums"]["ReportTarget"]
          targetUserId?: string | null
          updatedAt: string
        }
        Update: {
          createdAt?: string
          description?: string | null
          evidence?: string[] | null
          handledAt?: string | null
          handledBy?: string | null
          id?: string
          postId?: string | null
          reason?: Database["public"]["Enums"]["ReportReason"]
          reporterId?: string
          resolution?: string | null
          status?: Database["public"]["Enums"]["ReportStatus"]
          targetType?: Database["public"]["Enums"]["ReportTarget"]
          targetUserId?: string | null
          updatedAt?: string
        }
        Relationships: []
      }
      Review: {
        Row: {
          comment: string | null
          createdAt: string
          id: string
          images: string[] | null
          orderId: string
          rating: number
          revieweeId: string
          reviewerId: string
        }
        Insert: {
          comment?: string | null
          createdAt?: string
          id: string
          images?: string[] | null
          orderId: string
          rating: number
          revieweeId: string
          reviewerId: string
        }
        Update: {
          comment?: string | null
          createdAt?: string
          id?: string
          images?: string[] | null
          orderId?: string
          rating?: number
          revieweeId?: string
          reviewerId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Review_orderId_fkey"
            columns: ["orderId"]
            isOneToOne: false
            referencedRelation: "Order"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Review_revieweeId_fkey"
            columns: ["revieweeId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Review_reviewerId_fkey"
            columns: ["reviewerId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      SearchHistory: {
        Row: {
          createdAt: string
          id: string
          keyword: string
          resultCount: number
        }
        Insert: {
          createdAt?: string
          id: string
          keyword: string
          resultCount?: number
        }
        Update: {
          createdAt?: string
          id?: string
          keyword?: string
          resultCount?: number
        }
        Relationships: []
      }
      Session: {
        Row: {
          expires: string
          id: string
          sessionToken: string
          userId: string
        }
        Insert: {
          expires: string
          id: string
          sessionToken: string
          userId: string
        }
        Update: {
          expires?: string
          id?: string
          sessionToken?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "Session_userId_fkey"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["id"]
          },
        ]
      }
      ShippingAdBid: {
        Row: {
          bidAmount: number
          companyId: string
          createdAt: string
          id: string
          isWinner: boolean
          slotId: string
          status: Database["public"]["Enums"]["BidStatus"]
          weekEnd: string
          weekStart: string
          winPosition: number | null
        }
        Insert: {
          bidAmount: number
          companyId: string
          createdAt?: string
          id: string
          isWinner?: boolean
          slotId: string
          status?: Database["public"]["Enums"]["BidStatus"]
          weekEnd: string
          weekStart: string
          winPosition?: number | null
        }
        Update: {
          bidAmount?: number
          companyId?: string
          createdAt?: string
          id?: string
          isWinner?: boolean
          slotId?: string
          status?: Database["public"]["Enums"]["BidStatus"]
          weekEnd?: string
          weekStart?: string
          winPosition?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ShippingAdBid_companyId_fkey"
            columns: ["companyId"]
            isOneToOne: false
            referencedRelation: "ShippingCompany"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ShippingAdBid_slotId_fkey"
            columns: ["slotId"]
            isOneToOne: false
            referencedRelation: "AdSlot"
            referencedColumns: ["id"]
          },
        ]
      }
      ShippingCompany: {
        Row: {
          averageRating: number
          businessLicenseUrl: string
          createdAt: string
          damageRate: number
          description: string | null
          hasExcellentBadge: boolean
          id: string
          isVerified: boolean
          logo: string | null
          lossRate: number
          minimumFee: number | null
          name: string
          nameZh: string
          onTimeRate: number
          pricePerKg: number | null
          serviceRoutes: Json
          totalShipments: number
          updatedAt: string
        }
        Insert: {
          averageRating?: number
          businessLicenseUrl: string
          createdAt?: string
          damageRate?: number
          description?: string | null
          hasExcellentBadge?: boolean
          id: string
          isVerified?: boolean
          logo?: string | null
          lossRate?: number
          minimumFee?: number | null
          name: string
          nameZh: string
          onTimeRate?: number
          pricePerKg?: number | null
          serviceRoutes: Json
          totalShipments?: number
          updatedAt: string
        }
        Update: {
          averageRating?: number
          businessLicenseUrl?: string
          createdAt?: string
          damageRate?: number
          description?: string | null
          hasExcellentBadge?: boolean
          id?: string
          isVerified?: boolean
          logo?: string | null
          lossRate?: number
          minimumFee?: number | null
          name?: string
          nameZh?: string
          onTimeRate?: number
          pricePerKg?: number | null
          serviceRoutes?: Json
          totalShipments?: number
          updatedAt?: string
        }
        Relationships: []
      }
      ShippingReview: {
        Row: {
          comment: string | null
          communication: number
          companyId: string
          createdAt: string
          deliverySpeed: number
          id: string
          isDamaged: boolean
          isLost: boolean
          isOnTime: boolean
          packaging: number
          rating: number
          userId: string
        }
        Insert: {
          comment?: string | null
          communication: number
          companyId: string
          createdAt?: string
          deliverySpeed: number
          id: string
          isDamaged?: boolean
          isLost?: boolean
          isOnTime?: boolean
          packaging: number
          rating: number
          userId: string
        }
        Update: {
          comment?: string | null
          communication?: number
          companyId?: string
          createdAt?: string
          deliverySpeed?: number
          id?: string
          isDamaged?: boolean
          isLost?: boolean
          isOnTime?: boolean
          packaging?: number
          rating?: number
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "ShippingReview_companyId_fkey"
            columns: ["companyId"]
            isOneToOne: false
            referencedRelation: "ShippingCompany"
            referencedColumns: ["id"]
          },
        ]
      }
      SupportResponse: {
        Row: {
          attachments: string[] | null
          content: string
          createdAt: string
          id: string
          isAdmin: boolean
          responderId: string
          ticketId: string
        }
        Insert: {
          attachments?: string[] | null
          content: string
          createdAt?: string
          id: string
          isAdmin?: boolean
          responderId: string
          ticketId: string
        }
        Update: {
          attachments?: string[] | null
          content?: string
          createdAt?: string
          id?: string
          isAdmin?: boolean
          responderId?: string
          ticketId?: string
        }
        Relationships: [
          {
            foreignKeyName: "SupportResponse_ticketId_fkey"
            columns: ["ticketId"]
            isOneToOne: false
            referencedRelation: "SupportTicket"
            referencedColumns: ["id"]
          },
        ]
      }
      SupportTicket: {
        Row: {
          assignedTo: string | null
          attachments: string[] | null
          category: Database["public"]["Enums"]["SupportCategory"]
          content: string
          createdAt: string
          email: string
          id: string
          name: string
          orderId: string | null
          phone: string | null
          priority: Database["public"]["Enums"]["SupportPriority"]
          resolvedAt: string | null
          status: Database["public"]["Enums"]["SupportStatus"]
          subject: string
          updatedAt: string
          userId: string | null
        }
        Insert: {
          assignedTo?: string | null
          attachments?: string[] | null
          category: Database["public"]["Enums"]["SupportCategory"]
          content: string
          createdAt?: string
          email: string
          id: string
          name: string
          orderId?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["SupportPriority"]
          resolvedAt?: string | null
          status?: Database["public"]["Enums"]["SupportStatus"]
          subject: string
          updatedAt: string
          userId?: string | null
        }
        Update: {
          assignedTo?: string | null
          attachments?: string[] | null
          category?: Database["public"]["Enums"]["SupportCategory"]
          content?: string
          createdAt?: string
          email?: string
          id?: string
          name?: string
          orderId?: string | null
          phone?: string | null
          priority?: Database["public"]["Enums"]["SupportPriority"]
          resolvedAt?: string | null
          status?: Database["public"]["Enums"]["SupportStatus"]
          subject?: string
          updatedAt?: string
          userId?: string | null
        }
        Relationships: []
      }
      User: {
        Row: {
          averageRating: number
          badgeAwardedAt: string | null
          businessLicenseUrl: string | null
          businessName: string | null
          businessNumber: string | null
          businessVerifiedAt: string | null
          country: Database["public"]["Enums"]["Country"]
          createdAt: string
          disputeRate: number
          email: string | null
          emailVerified: string | null
          fcmToken: string | null
          fcmTokenUpdatedAt: string | null
          hasExcellentBadge: boolean
          id: string
          identityVerifiedAt: string | null
          image: string | null
          isBusinessVerified: boolean
          isIdentityVerified: boolean
          isPhoneVerified: boolean
          language: Database["public"]["Enums"]["Language"]
          name: string | null
          nickname: string | null
          phone: string | null
          phoneCountry: string | null
          phoneVerified: string | null
          profileImage: string | null
          totalPurchases: number
          totalSales: number
          updatedAt: string
          userType: Database["public"]["Enums"]["UserType"]
        }
        Insert: {
          averageRating?: number
          badgeAwardedAt?: string | null
          businessLicenseUrl?: string | null
          businessName?: string | null
          businessNumber?: string | null
          businessVerifiedAt?: string | null
          country?: Database["public"]["Enums"]["Country"]
          createdAt?: string
          disputeRate?: number
          email?: string | null
          emailVerified?: string | null
          fcmToken?: string | null
          fcmTokenUpdatedAt?: string | null
          hasExcellentBadge?: boolean
          id: string
          identityVerifiedAt?: string | null
          image?: string | null
          isBusinessVerified?: boolean
          isIdentityVerified?: boolean
          isPhoneVerified?: boolean
          language?: Database["public"]["Enums"]["Language"]
          name?: string | null
          nickname?: string | null
          phone?: string | null
          phoneCountry?: string | null
          phoneVerified?: string | null
          profileImage?: string | null
          totalPurchases?: number
          totalSales?: number
          updatedAt: string
          userType?: Database["public"]["Enums"]["UserType"]
        }
        Update: {
          averageRating?: number
          badgeAwardedAt?: string | null
          businessLicenseUrl?: string | null
          businessName?: string | null
          businessNumber?: string | null
          businessVerifiedAt?: string | null
          country?: Database["public"]["Enums"]["Country"]
          createdAt?: string
          disputeRate?: number
          email?: string | null
          emailVerified?: string | null
          fcmToken?: string | null
          fcmTokenUpdatedAt?: string | null
          hasExcellentBadge?: boolean
          id?: string
          identityVerifiedAt?: string | null
          image?: string | null
          isBusinessVerified?: boolean
          isIdentityVerified?: boolean
          isPhoneVerified?: boolean
          language?: Database["public"]["Enums"]["Language"]
          name?: string | null
          nickname?: string | null
          phone?: string | null
          phoneCountry?: string | null
          phoneVerified?: string | null
          profileImage?: string | null
          totalPurchases?: number
          totalSales?: number
          updatedAt?: string
          userType?: Database["public"]["Enums"]["UserType"]
        }
        Relationships: []
      }
      UserCoupon: {
        Row: {
          couponId: string
          createdAt: string
          id: string
          orderId: string | null
          status: Database["public"]["Enums"]["CouponStatus"]
          usedAt: string | null
          userId: string
        }
        Insert: {
          couponId: string
          createdAt?: string
          id: string
          orderId?: string | null
          status?: Database["public"]["Enums"]["CouponStatus"]
          usedAt?: string | null
          userId: string
        }
        Update: {
          couponId?: string
          createdAt?: string
          id?: string
          orderId?: string | null
          status?: Database["public"]["Enums"]["CouponStatus"]
          usedAt?: string | null
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "UserCoupon_couponId_fkey"
            columns: ["couponId"]
            isOneToOne: false
            referencedRelation: "Coupon"
            referencedColumns: ["id"]
          },
        ]
      }
      UserPoint: {
        Row: {
          balance: number
          createdAt: string
          id: string
          totalEarned: number
          totalUsed: number
          updatedAt: string
          userId: string
        }
        Insert: {
          balance?: number
          createdAt?: string
          id: string
          totalEarned?: number
          totalUsed?: number
          updatedAt: string
          userId: string
        }
        Update: {
          balance?: number
          createdAt?: string
          id?: string
          totalEarned?: number
          totalUsed?: number
          updatedAt?: string
          userId?: string
        }
        Relationships: []
      }
      VerificationToken: {
        Row: {
          expires: string
          identifier: string
          token: string
        }
        Insert: {
          expires: string
          identifier: string
          token: string
        }
        Update: {
          expires?: string
          identifier?: string
          token?: string
        }
        Relationships: []
      }
      Wishlist: {
        Row: {
          createdAt: string
          id: string
          postId: string
          userId: string
        }
        Insert: {
          createdAt?: string
          id: string
          postId: string
          userId: string
        }
        Update: {
          createdAt?: string
          id?: string
          postId?: string
          userId?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      BidStatus: "PENDING" | "WON" | "LOST" | "REFUNDED"
      Country: "KR" | "CN"
      CouponStatus: "AVAILABLE" | "USED" | "EXPIRED"
      DiscountType: "FIXED" | "PERCENTAGE"
      DisputeStatus: "OPEN" | "VOTING" | "RESOLVED" | "APPEALED"
      Language: "KO" | "ZH"
      LiveStatus: "SCHEDULED" | "LIVE" | "ENDED" | "CANCELLED"
      MessageType: "TEXT" | "IMAGE" | "SYSTEM"
      NotificationType:
        | "ORDER"
        | "PAYMENT"
        | "SHIPPING"
        | "DISPUTE"
        | "REVIEW"
        | "SYSTEM"
        | "SUPPORT"
      OfferStatus: "PENDING" | "ACCEPTED" | "REJECTED" | "WITHDRAWN"
      OrderStatus:
        | "PENDING_PAYMENT"
        | "PAID"
        | "SHIPPING"
        | "DELIVERED"
        | "CONFIRMED"
        | "DISPUTED"
        | "REFUNDED"
        | "CANCELLED"
      PaymentMethod:
        | "NAVER_PAY"
        | "KAKAO_PAY"
        | "ALIPAY"
        | "WECHAT_PAY"
        | "PAYPAL"
        | "CREDIT_CARD"
      PaymentStatus:
        | "PENDING"
        | "COMPLETED"
        | "ESCROW_HELD"
        | "RELEASED"
        | "REFUNDED"
        | "FAILED"
      PointType:
        | "VOTE_REWARD"
        | "SIGNUP_BONUS"
        | "ORDER_REWARD"
        | "REVIEW_REWARD"
        | "REFERRAL_REWARD"
        | "COUPON_EXCHANGE"
        | "ORDER_USE"
        | "ADMIN_ADJUST"
        | "EXPIRED"
      PostStatus: "ACTIVE" | "SOLD_OUT" | "EXPIRED" | "HIDDEN" | "DELETED"
      PostType: "SELL" | "BUY"
      PurchaseRequestStatus:
        | "OPEN"
        | "IN_PROGRESS"
        | "COMPLETED"
        | "CANCELLED"
        | "EXPIRED"
      QAStatus: "PENDING" | "ANSWERED" | "DELETED"
      ReportReason:
        | "SPAM"
        | "FRAUD"
        | "INAPPROPRIATE"
        | "COUNTERFEIT"
        | "HARASSMENT"
        | "PROHIBITED_ITEM"
        | "OTHER"
      ReportStatus: "PENDING" | "REVIEWING" | "RESOLVED" | "DISMISSED"
      ReportTarget: "POST" | "USER" | "REVIEW" | "CHAT"
      SlotType: "PRODUCT" | "SHIPPING"
      SupportCategory:
        | "ORDER"
        | "SHIPPING"
        | "REFUND"
        | "ACCOUNT"
        | "TECHNICAL"
        | "REPORT"
        | "SUGGESTION"
        | "OTHER"
      SupportPriority: "LOW" | "NORMAL" | "HIGH" | "URGENT"
      SupportStatus:
        | "OPEN"
        | "IN_PROGRESS"
        | "WAITING_REPLY"
        | "RESOLVED"
        | "CLOSED"
      TradeDirection: "KR_TO_CN" | "CN_TO_KR"
      UserType: "BUYER" | "SELLER" | "BOTH" | "SHIPPING" | "ADMIN"
      VoteFor: "BUYER" | "SELLER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      BidStatus: ["PENDING", "WON", "LOST", "REFUNDED"],
      Country: ["KR", "CN"],
      CouponStatus: ["AVAILABLE", "USED", "EXPIRED"],
      DiscountType: ["FIXED", "PERCENTAGE"],
      DisputeStatus: ["OPEN", "VOTING", "RESOLVED", "APPEALED"],
      Language: ["KO", "ZH"],
      LiveStatus: ["SCHEDULED", "LIVE", "ENDED", "CANCELLED"],
      MessageType: ["TEXT", "IMAGE", "SYSTEM"],
      NotificationType: [
        "ORDER",
        "PAYMENT",
        "SHIPPING",
        "DISPUTE",
        "REVIEW",
        "SYSTEM",
        "SUPPORT",
      ],
      OfferStatus: ["PENDING", "ACCEPTED", "REJECTED", "WITHDRAWN"],
      OrderStatus: [
        "PENDING_PAYMENT",
        "PAID",
        "SHIPPING",
        "DELIVERED",
        "CONFIRMED",
        "DISPUTED",
        "REFUNDED",
        "CANCELLED",
      ],
      PaymentMethod: [
        "NAVER_PAY",
        "KAKAO_PAY",
        "ALIPAY",
        "WECHAT_PAY",
        "PAYPAL",
        "CREDIT_CARD",
      ],
      PaymentStatus: [
        "PENDING",
        "COMPLETED",
        "ESCROW_HELD",
        "RELEASED",
        "REFUNDED",
        "FAILED",
      ],
      PointType: [
        "VOTE_REWARD",
        "SIGNUP_BONUS",
        "ORDER_REWARD",
        "REVIEW_REWARD",
        "REFERRAL_REWARD",
        "COUPON_EXCHANGE",
        "ORDER_USE",
        "ADMIN_ADJUST",
        "EXPIRED",
      ],
      PostStatus: ["ACTIVE", "SOLD_OUT", "EXPIRED", "HIDDEN", "DELETED"],
      PostType: ["SELL", "BUY"],
      PurchaseRequestStatus: [
        "OPEN",
        "IN_PROGRESS",
        "COMPLETED",
        "CANCELLED",
        "EXPIRED",
      ],
      QAStatus: ["PENDING", "ANSWERED", "DELETED"],
      ReportReason: [
        "SPAM",
        "FRAUD",
        "INAPPROPRIATE",
        "COUNTERFEIT",
        "HARASSMENT",
        "PROHIBITED_ITEM",
        "OTHER",
      ],
      ReportStatus: ["PENDING", "REVIEWING", "RESOLVED", "DISMISSED"],
      ReportTarget: ["POST", "USER", "REVIEW", "CHAT"],
      SlotType: ["PRODUCT", "SHIPPING"],
      SupportCategory: [
        "ORDER",
        "SHIPPING",
        "REFUND",
        "ACCOUNT",
        "TECHNICAL",
        "REPORT",
        "SUGGESTION",
        "OTHER",
      ],
      SupportPriority: ["LOW", "NORMAL", "HIGH", "URGENT"],
      SupportStatus: [
        "OPEN",
        "IN_PROGRESS",
        "WAITING_REPLY",
        "RESOLVED",
        "CLOSED",
      ],
      TradeDirection: ["KR_TO_CN", "CN_TO_KR"],
      UserType: ["BUYER", "SELLER", "BOTH", "SHIPPING", "ADMIN"],
      VoteFor: ["BUYER", "SELLER"],
    },
  },
} as const
