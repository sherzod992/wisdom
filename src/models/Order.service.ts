import {
    Order,
    OrderInquiry,
    OrderItemInput,
    OrderUpdateInput,
  } from "../libs/types/order";
  import { Member } from "../libs/types/member";
  import OrderModel from "../schema/Order.model";
  import OrderItemModel from "../schema/OrderItem.model";
  import { shapeIntoMongooseObjectId } from "../libs/config";
  import Errors, { HttpCode, Message } from "../libs/Errors";
  import { ObjectId } from "mongoose";
  import MemberService from "./Member.service";
  import { OrderStatus } from "../libs/enums/order.enum";
  
  class OrderService {
    private readonly orderModel;
    private readonly orderItemModel;
    private readonly memberService;
  
    constructor() {
      this.orderModel = OrderModel;
      this.orderItemModel = OrderItemModel;
      this.memberService = new MemberService();
    }
  
    public async createOrder(
      member: Member,
      input: OrderItemInput[]
    ): Promise<Order> {
      const memberId = shapeIntoMongooseObjectId(member._id);
  
      const amount = input.reduce(
        (accumulator: number, item: OrderItemInput) =>
          accumulator + item.itemPrice * item.itemQuantity,
        0
      );
  
      const delivery = 0; // Video darslarda yetkazib berish yo‘q
  
      try {
        const newOrderDocument = await this.orderModel.create({
          orderTotal: amount + delivery,
          orderDelivery: delivery,
          memberId,
        });
  
        const newOrder: Order = newOrderDocument.toObject() as unknown as Order;
  
        const orderId = newOrder._id;
        console.log("orderId:", newOrder._id);
  
        await this.recordOrderItem(orderId, input);
  
        return newOrder;
      } catch (err) {
        console.log("Error, model:createOrder:", err);
        throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
      }
    }
  
    private async recordOrderItem(
      orderId: ObjectId,
      input: OrderItemInput[]
    ): Promise<void> {
      const promisedList = input.map(async (item: OrderItemInput) => {
        item.orderId = orderId;
        item.lessonId = shapeIntoMongooseObjectId(item.lessonId); // <== productId o'rniga
        await this.orderItemModel.create(item);
        return "INSERTED";
      });
  
      const orderItemState = await Promise.all(promisedList);
      console.log("orderItemState:", orderItemState);
    }
  
    public async getMyOrders(
      member: Member,
      inquiry: OrderInquiry
    ): Promise<Order[]> {
      const memberId = shapeIntoMongooseObjectId(member._id);
      const matches = { memberId: memberId, orderStatus: inquiry.orderStatus };
  
      const result = await this.orderModel
        .aggregate([
          { $match: matches },
          { $sort: { updatedAt: -1 } },
          { $skip: (inquiry.page - 1) * inquiry.limit },
          { $limit: inquiry.limit },
          {
            $lookup: {
              from: "orderItems",
              localField: "_id",
              foreignField: "orderId",
              as: "orderItems",
            },
          },
          {
            $lookup: {
              from: "lessons", // <== products o'rniga
              localField: "orderItems.lessonId", // <== productId o'rniga
              foreignField: "_id",
              as: "lessonData", // <== productData o'rniga
            },
          },
        ])
        .exec();
  
      if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
  
      return result;
    }
  
    public async updateOrder(
      member: Member,
      input: OrderUpdateInput
    ): Promise<Order> {
      const memberId = shapeIntoMongooseObjectId(member._id),
        orderId = shapeIntoMongooseObjectId(input.orderId),
        orderStatus = input.orderStatus;
  
      const result = await this.orderModel
        .findOneAndUpdate(
          {
            memberId: memberId,
            _id: orderId,
          },
          { orderStatus: orderStatus },
          { new: true }
        )
        .exec();
  
      if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);
  
    //   if (orderStatus === OrderStatus.PROCESS) {
    //     await this.memberService.addUserPoint(member, 1);
    //   }
  
      return result.toObject() as unknown as Order;
    }
  }
  
  export default OrderService;
  