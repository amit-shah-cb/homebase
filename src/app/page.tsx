import { VideoFeed } from './components/VideoFeed';

export default function Home() {
  return (
    <div className="app">
      <div className="app__videos">
        <VideoFeed />
      </div>
    </div>
      
  );
}
