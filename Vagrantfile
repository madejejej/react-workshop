# -*- mode: ruby -*-
# vi: set ft=ruby :

# This is Untitled Kingdom's Vagrantfile
# We decided against both Chef and Puppet because they were too slow.

vmconfig = {
  ip: '192.168.13.37',

  apt: ['postgresql-contrib'],

  services: [],
  plugins: ['vagrant-exec', 'vagrant-host-path']
}

#
########################### ADVANCED CONFIGURATION ############################
#

# This is a provision script. It's executed as a root user during first run.
# It's necessary for the first run to work successfully
#
# You can add your own code here but please do not modify the existing one
# unless absolutely necessary

$provision_script = <<SCRIPT
#!/bin/bash

function pink() {
  echo -e "\033[95m${1}\033[0m"
}

cd /vagrant

pink "Updating APT repositories..."
apt-get update -qq -y --force-yes >/dev/null

#{"apt-get install " + vmconfig[:apt].join(' ') + " -qq -y --force-yes" unless vmconfig[:apt].empty?}

# If you want to add any custom commands, they should go right here ...

pink "Preparing application for the first run..."
exec sudo -u vagrant -i /bin/bash - << eof
  cd /vagrant
  bundle install
  bundle exec rake db:create db:schema:load db:seed db:test:prepare
eof
SCRIPT


#
########################### VAGRANT CONFIGURATION #############################
#

vmconfig[:plugins].each { |name| exec("vagrant plugin install #{name}") unless Vagrant.has_plugin?(name) }

Vagrant.configure("2") do |config|
  config.vm.box = "d4rky/rails"
  config.vm.network "private_network", ip: vmconfig[:ip]
  config.vm.network :forwarded_port, guest: 3000, host: 4000, auto_correct: true

  config.vm.provision "shell", inline: $provision_script

  config.vm.synced_folder ".", "/vagrant", type: "nfs"
  config.ssh.forward_agent = true

  #
  # To make it work:
  #
  #     $ vagrant plugin install vagrant-exec
  #
  config.exec.commands 'bundle'
  config.exec.commands %w(rails rake), prepend: 'bundle exec'
end

# After starting up, connect to VM using `vagrant ssh`, `cd /vagrant` and `rails server`. It should be available on http://localhost:3000 now. Normally we use Puma but it's disabled here, hence additional step (sorry!)
