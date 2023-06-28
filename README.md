subdomain create app

1. docker create httpd
2. docker run -dit --name container1 -p 8080:80 httpd
3. docker run -dit --name container2 -p 8081:80 httpd
4. docker exec ec2d8f51fbdf sed -i 's/It works!/Container 1/' /usr/local/apache2/htdocs/index.html
5. docker exec bd4b11fa32b6 sed -i 's/It works!/Container 2/' /usr/local/apache2/htdocs/index.html
6. vi /etc/nginx/sites-available/test1.conf
7. vi /etc/nginx/sites-available/test2.conf

server {
    listen 80;
    server_name container1.test.com;

    location / {
        proxy_pass http://localhost:8080
    }
}

8. ln -s /etc/nginx/sites-available/test1.conf /etc/nginx/sites-enabled/
9. ln -s /etc/nginx/sites-available/test2.conf /etc/nginx/sites-enabled/
10. nginx -t
11. sudo service nginx reload

# For use in /etc/nginx/sites-available/default

# This directive redirects all(All is denoted by a dot prefix on the domain) HTTP requests of vietnoy.xyz and *.vietnoy.xyz to their HTTPS versions respectively

server {
  listen 80;
  listen [::]:80;
  server_name .vietnoy.xyz;

  return 301 https://$server_name$request_uri;
}

# This directive tells Nginx to use HTTP2 and SSL. And also proxy requests of <https://vietnoy.xyz> to a local Node.js app running on port 9000

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
  server_name vietnoy.xyz;

  ssl_certificate /etc/letsencrypt/live/vietnoy.xyz/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/vietnoy.xyz/privkey.pem;
  ssl_session_timeout 5m;

  location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-NginX-Proxy true;
    proxy_pass <http://localhost:9000/>;
    proxy_ssl_session_reuse off;
    proxy_set_header Host $http_host;
    proxy_cache_bypass $http_upgrade;
    proxy_redirect off;
  }
}

# This directive tells Nginx to use HTTP2 and SSL. And also proxy requests of wildcard *.vietnoy.xyz (first level subdomain of vietnoy.xyz) to a local Node.js app running on port 9000

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
  server_name*.vietnoy.xyz;

  ssl_certificate /etc/letsencrypt/live/vietnoy.xyz-0001/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/vietnoy.xyz-0001/privkey.pem;
  ssl_session_timeout 5m;

  location / {
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-NginX-Proxy true;
    proxy_pass <http://localhost:9000/>;
    proxy_ssl_session_reuse off;
    proxy_set_header Host $http_host;
    proxy_cache_bypass $http_upgrade;
    proxy_redirect off;
  }
}

const { exec } = require('child_process')

function run(cmd) {
  return new Promise((resolve, reject) => {
    exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(error)
      if (stderr) return reject(stderr)
      resolve(stdout)
    })
  })
}

// usage example
(async () => {

  const result = await run('sed -i s/subdomain/user1/g subdomain.conf')
  const result = await run('sed -i s/3001/1234/g subdomain.conf')
  const result = await run('cp subdomain.conf /etc/nginx/sites-available/subdomain.conf')
  const result = await run('ln -s /etc/nginx/sites-available/test1.conf /etc/nginx/sites-enabled/')
  const result = await run('nginx -t')
  const result = await run('sudo service nginx reload')
  console.log(result) // hello
})();
