### Run server
- Go to `./apps/lightshow-server`
- Run `npm i`
- Run `npm run dev`

### Run app
- Go to `./apps/lightshow-app`
- Run `npm i`
- Edit `.env` file and put URL of server (can be localhost or local ip for testing)
- Run `npm start`
  NOTE: if you modify the .env file, you have to use `npm start -- --reset-cache` to clear the cache
- EITHER scan QR code with Expo Go app on real device
- OR press i or a to open iOS or Android Emulator