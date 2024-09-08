import mongoose, {Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const VideoSchema= new Schema({
    VideoFile:{
        type:String,//cloudanary
        required:true
    },
    Thumbnail:{
        type:String,
        required:true,
    },
    Tittle:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    View:{
        type:Number,
        default:0
    },
    Duration:{
        type:Number,
        required:true
    },
    isPublished:{
        type:Boolean,
        default:true
    },
    Owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    }

},
{
   timestamps:true
}
)
VideoSchema.plugin(mongooseAggregatePaginate)
export const Video=mongoose.model("Video",VideoSchema)


// tittle,
// description,
// view,
// duration,
// isPublished,
// owner,