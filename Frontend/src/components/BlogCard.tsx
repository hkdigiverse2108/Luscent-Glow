import { forwardRef } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Calendar, Clock, User } from "lucide-react";
import { BlogPost } from "@/data/blogData";
import { Link } from "react-router-dom";

interface BlogCardProps {
  post: BlogPost;
  index: number;
}

const BlogCard = forwardRef<HTMLDivElement, BlogCardProps>(({ post, index }, ref) => {
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8 }}
      className="group"
    >
      <Link to={`/blogs/${post.id}`} className="block relative overflow-hidden rounded-[2.5rem] bg-secondary aspect-[4/5] mb-6 shadow-ethereal">
        {/* Hover Icon */}
        <div className="absolute inset-0 z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="w-16 h-16 bg-gold/90 rounded-full flex items-center justify-center text-primary transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            <ArrowUpRight size={24} />
          </div>
        </div>

        {/* Image */}
        <motion.img
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 1.5 }}
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover transition-all duration-700 group-hover:blur-[2px]"
        />
        
        {/* Subtle Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 to-transparent group-hover:from-charcoal/60 transition-all duration-500" />
      </Link>

      <div className="space-y-4 px-2">
        <div className="flex items-center gap-4 text-[10px] font-body font-bold text-muted-foreground uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-gold/60" />
            {post.date}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-gold/60" />
            {post.readTime}
          </div>
        </div>

        <h3 className="font-display text-2xl font-semibold text-foreground group-hover:text-gold transition-colors duration-500 leading-snug">
          {post.title}
        </h3>

        <p className="text-muted-foreground font-body text-sm leading-relaxed line-clamp-2">
          {post.excerpt}
        </p>

        <div className="flex items-center gap-2 pt-2">
          <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center border border-border">
            <User size={12} className="text-muted-foreground" />
          </div>
          <span className="text-[10px] font-body font-medium text-foreground uppercase tracking-widest">{post.author}</span>
        </div>
      </div>
    </motion.div>
  );
});

BlogCard.displayName = "BlogCard";

export default BlogCard;
