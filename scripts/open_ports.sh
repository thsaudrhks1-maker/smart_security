#!/bin/bash
# 3500(Front), 8500(Back) 포트 개방
echo "Simulating port opening for 3500 and 8500..."

# iptables 명령어 (sudo 권한 필요)
# 기존 규칙 삭제 (중복 방지)
sudo iptables -D INPUT -p tcp --dport 3500 -j ACCEPT 2>/dev/null
sudo iptables -D INPUT -p tcp --dport 8500 -j ACCEPT 2>/dev/null

# 새 규칙 추가
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3500 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8500 -j ACCEPT

# 설정 저장
sudo netfilter-persistent save

echo "Ports 3500 and 8500 seem to be opened!"
sudo iptables -L INPUT -n --line-numbers | grep -E "3500|8500"
