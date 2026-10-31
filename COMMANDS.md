Frontend - 

risha@Admin MINGW64 ~/Downloads/matchlens_cricket_companion/project
$ npm install

up to date, audited 437 packages in 29s

71 packages are looking for funding
  run `npm fund` for details

27 vulnerabilities (2 low, 9 moderate, 16 high)

To address issues that do not require attention, run:
  npm audit fix

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

risha@Admin MINGW64 ~/Downloads/matchlens_cricket_companion/project
$ source /c/Users/risha/Downloads/matchlens_cricket_companion/project/backend/.venv/Scripts/activate
(.venv) 
risha@Admin MINGW64 ~/Downloads/matchlens_cricket_companion/project
$ npm run dev

> vite-react-typescript-starter@0.0.0 dev
> vite


  VITE v5.4.8  ready in 1992 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
Browserslist: caniuse-lite is outdated. Please run:
  npx update-browserslist-db@latest
  Why you should do it regularly: https://github.com/browserslist/update-db#readme

(.venv) 
risha@Admin MINGW64 ~/Downloads/matchlens_cricket_companion/project
$ 



Backend - 

cd C:\Users\risha\Downloads\matchlens_cricket_companion\project\backend

python -m venv .venv
.\.venv\Scripts\Activate.ps1 or in windows there is bash command

python -m pip install --upgrade pip
pip install -r requirements.txt

risha@Admin MINGW64 ~/Downloads/matchlens_cricket_companion/project/backend
$ uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
INFO:     Will watch for changes in these directories: ['C:\\Users\\risha\\Downloads\\matchlens_cricket_companion\\project\\backend']
ERROR:    [WinError 10013] An attempt was made to access a socket in a way forbidden by its access permissions
(.venv) 
risha@Admin MINGW64 ~/Downloads/matchlens_cricket_companion/project/backend
$ uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
INFO:     Will watch for changes in these directories: ['C:\\Users\\risha\\Downloads\\matchlens_cricket_companion\\project\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [75800] using WatchFiles
INFO:     Started server process [17028]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     127.0.0.1:58372 - "OPTIONS /api/matches HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches HTTP/1.1" 200 OK
INFO:     127.0.0.1:58372 - "GET /api/matches HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/demo-t20-northern-coastal/state?ball_index=0 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58372 - "OPTIONS /api/matches/demo-t20-northern-coastal/state?ball_index=0 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58372 - "GET /api/matches/demo-t20-northern-coastal/state?ball_index=0 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/demo-t20-northern-coastal/state?ball_index=0 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/demo-t20-northern-coastal/state?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58372 - "OPTIONS /api/matches/demo-t20-northern-coastal/timeline?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:64147 - "OPTIONS /api/matches/demo-t20-northern-coastal/state?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/demo-t20-northern-coastal/timeline?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/demo-t20-northern-coastal/insights?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:53399 - "OPTIONS /api/matches/demo-t20-northern-coastal/insights?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58372 - "GET /api/matches/demo-t20-northern-coastal/state?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:53399 - "GET /api/matches/demo-t20-northern-coastal/timeline?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/demo-t20-northern-coastal/insights?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58372 - "GET /api/matches/demo-t20-northern-coastal/state?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/demo-t20-northern-coastal/timeline?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:64147 - "GET /api/matches/demo-t20-northern-coastal/insights?ball_index=41 HTTP/1.1" 200 OK
INFO:     127.0.0.1:64147 - "OPTIONS /api/matches/1082591/state?ball_index=0 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/state?ball_index=0 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/state?ball_index=0 HTTP/1.1" 200 OK
INFO:     127.0.0.1:64147 - "GET /api/matches/1082591/state?ball_index=0 HTTP/1.1" 200 OK
INFO:     127.0.0.1:64147 - "OPTIONS /api/matches/1082591/state?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/timeline?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58372 - "OPTIONS /api/matches/1082591/insights?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:53399 - "OPTIONS /api/matches/1082591/timeline?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/insights?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/state?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:64147 - "GET /api/matches/1082591/insights?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/timeline?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:58372 - "GET /api/matches/1082591/state?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/insights?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/timeline?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/state?ball_index=73 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/replay/advance HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/state?ball_index=74 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/timeline?ball_index=74 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/insights?ball_index=74 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/state?ball_index=74 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/insights?ball_index=74 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/timeline?ball_index=74 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/state?ball_index=75 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/insights?ball_index=75 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/timeline?ball_index=75 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/insights?ball_index=75 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/timeline?ball_index=75 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/state?ball_index=75 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/state?ball_index=76 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/insights?ball_index=76 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/timeline?ball_index=76 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/insights?ball_index=76 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/timeline?ball_index=76 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/state?ball_index=76 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/state?ball_index=77 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/timeline?ball_index=77 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/insights?ball_index=77 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/timeline?ball_index=77 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/state?ball_index=77 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/insights?ball_index=77 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/state?ball_index=78 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/timeline?ball_index=78 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/insights?ball_index=78 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/timeline?ball_index=78 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/insights?ball_index=78 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/state?ball_index=78 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/state?ball_index=79 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/insights?ball_index=79 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/timeline?ball_index=79 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/insights?ball_index=79 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/timeline?ball_index=79 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/state?ball_index=79 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/state?ball_index=80 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/timeline?ball_index=80 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/insights?ball_index=80 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/insights?ball_index=80 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/timeline?ball_index=80 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/state?ball_index=80 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/state?ball_index=81 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/timeline?ball_index=81 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/insights?ball_index=81 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/insights?ball_index=81 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/timeline?ball_index=81 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/state?ball_index=81 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/state?ball_index=82 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/timeline?ball_index=82 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/insights?ball_index=82 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/timeline?ball_index=82 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/insights?ball_index=82 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/state?ball_index=82 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/state?ball_index=83 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/insights?ball_index=83 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/timeline?ball_index=83 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/state?ball_index=83 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/insights?ball_index=83 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/timeline?ball_index=83 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/state?ball_index=84 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/timeline?ball_index=84 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/insights?ball_index=84 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/timeline?ball_index=84 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/state?ball_index=84 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/insights?ball_index=84 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "OPTIONS /api/matches/1082591/state?ball_index=85 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "OPTIONS /api/matches/1082591/insights?ball_index=85 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "OPTIONS /api/matches/1082591/timeline?ball_index=85 HTTP/1.1" 200 OK
INFO:     127.0.0.1:54599 - "GET /api/matches/1082591/insights?ball_index=85 HTTP/1.1" 200 OK
INFO:     127.0.0.1:60118 - "GET /api/matches/1082591/state?ball_index=85 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "GET /api/matches/1082591/timeline?ball_index=85 HTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "POST /api/matches/1082591/replay/advanceHTTP/1.1" 200 OK
INFO:     127.0.0.1:57621 - "