import mongoose,{Schema, Types} from "mongoose";
const PlaylistSchema= new Schema({
    Name:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    videos:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }],
    Owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }
},
{
    timestamps:true
}
)
export const Playlist=mongoose.model("Playlist",PlaylistSchema)
// comment, tweet like