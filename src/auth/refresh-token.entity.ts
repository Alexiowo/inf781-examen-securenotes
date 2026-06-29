import { User } from '../users/user.entity';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
} from 'typeorm';

@Entity('refresh_tokens')
export class RefreshToken {
    @PrimaryColumn('uuid')
    id!: string;

    @Column()
    userId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column()
    hashedToken!: string;

    @Column({ type: 'varchar', nullable: true })
    userAgent!: string | null;

    @Column({ default: false })
    revoked!: boolean;

    @Column({ type: 'timestamptz' })
    expiresAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}