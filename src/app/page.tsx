import Image from "next/image";
import { Video } from "./components/Video";

export default function Home() {
  return (
    <div className="app">
      <div className="app__videos">
        <Video 
          url="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
          channel="channelName"
          description="Video description here"
          song="Original Sound - Artist Name"
          likes={1234}
          messages={321}
          shares={100}
        />
         <Video 
          url="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
          channel="channelName"
          description="Video description here"
          song="Original Sound - Artist Name"
          likes={1234}
          messages={321}
          shares={100}
        />
         <Video 
          url="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
          channel="channelName"
          description="Video description here"
          song="Original Sound - Artist Name"
          likes={1234}
          messages={321}
          shares={100}
        />
         <Video 
          url="https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4"
          channel="channelName"
          description="Video description here"
          song="Original Sound - Artist Name"
          likes={1234}
          messages={321}
          shares={100}
        />
      </div>
    </div>
      
  );
}
