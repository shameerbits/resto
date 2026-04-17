CREATE DATABASE IF NOT EXISTS resto_mvp;
USE resto_mvp;

CREATE TABLE IF NOT EXISTS menu_items (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(120) NOT NULL,
	description TEXT NULL,
	price DECIMAL(10,2) NOT NULL,
	is_available TINYINT(1) NOT NULL DEFAULT 1,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	INDEX idx_menu_items_is_available (is_available)
);

CREATE TABLE IF NOT EXISTS ingredients (
	id INT AUTO_INCREMENT PRIMARY KEY,
	name VARCHAR(120) NOT NULL,
	unit VARCHAR(20) NOT NULL,
	stock_quantity DECIMAL(12,3) NOT NULL DEFAULT 0.000,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_ingredients_name (name)
);

CREATE TABLE IF NOT EXISTS menu_item_recipes (
	id INT AUTO_INCREMENT PRIMARY KEY,
	menu_item_id INT NOT NULL,
	ingredient_id INT NOT NULL,
	quantity_required DECIMAL(12,3) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT fk_menu_item_recipes_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
	CONSTRAINT fk_menu_item_recipes_ingredient_id FOREIGN KEY (ingredient_id) REFERENCES ingredients(id),
	UNIQUE KEY uq_menu_recipe_item_ingredient (menu_item_id, ingredient_id),
	INDEX idx_menu_item_recipes_menu_item_id (menu_item_id),
	INDEX idx_menu_item_recipes_ingredient_id (ingredient_id)
);

CREATE TABLE IF NOT EXISTS orders (
	id INT AUTO_INCREMENT PRIMARY KEY,
	status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
	total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
	notes VARCHAR(255) NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	INDEX idx_orders_status (status)
);

CREATE TABLE IF NOT EXISTS order_items (
	id INT AUTO_INCREMENT PRIMARY KEY,
	order_id INT NOT NULL,
	menu_item_id INT NOT NULL,
	quantity INT NOT NULL,
	unit_price DECIMAL(10,2) NOT NULL,
	line_total DECIMAL(10,2) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT fk_order_items_order_id FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
	CONSTRAINT fk_order_items_menu_item_id FOREIGN KEY (menu_item_id) REFERENCES menu_items(id),
	INDEX idx_order_items_order_id (order_id),
	INDEX idx_order_items_menu_item_id (menu_item_id)
);
