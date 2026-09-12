while true; do
  if ! pgrep -f "npm run lint" > /dev/null; then
    break
  fi
  sleep 1
done
