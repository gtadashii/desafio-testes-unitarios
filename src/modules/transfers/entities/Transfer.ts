import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/User";

import { v4 as uuidV4 } from "uuid";

@Entity("transfers")
class Transfer {
  @PrimaryColumn()
  id: string;

  @Column()
  sender_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "sender_id" })
  user: User;

  @Column()
  amount: number;

  @Column()
  description: string;

  @Column()
  type: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  constructor() {
    if (!this.id) {
      this.id = uuidV4();
    }
  }
}

export { Transfer };