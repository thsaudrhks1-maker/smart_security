#!/bin/bash
echo "Cleaning up duplicate firewall rules..."

# 3500, 8500 관련 규칙이 없을 때까지 계속 삭제 (while loop)
while sudo iptables -D INPUT -p tcp --dport 3500 -j ACCEPT 2>/dev/null; do :; done
while sudo iptables -D INPUT -p tcp --dport 8500 -j ACCEPT 2>/dev/null; do :; done

echo "All rules removed. Adding fresh rules..."

# 딱 하나씩만 다시 추가
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 3500 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8500 -j ACCEPT

# 저장 및 확인
sudo netfilter-persistent save
echo "Done! Current rules:"
sudo iptables -L INPUT -n --line-numbers | grep -E "3500|8500"
