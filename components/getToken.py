from librespot.core import Session
import json
import argparse, sys

data = '{"Error": false, "Token": null}'
dataJson = json.loads(data)

parser = argparse.ArgumentParser(
    description='Get Token for EXT-SpotifyCanvasLyrics',
    epilog="Support: https://forum.bugsounet.fr ©bugsounet 2023"
)

parser.add_argument("-u", "--user",
                    help="Define username",
                    required=True)
parser.add_argument("-p", "--password",
                    help="Define password",
                    required=True)

args = parser.parse_args(None if sys.argv[1:] else ['-h'])

try:
  session = Session.Builder().user_pass(args.user, args.password).create()
  access_token = session.tokens().get("playlist-read")
  dataJson["Token"] = access_token
  result = json.dumps(dataJson)
  print(result)
except Exception as e:
  dataJson["Error"] = str(e)
  result = json.dumps(dataJson)
  print(result)
